/**
 * Laws Page - AUREX Civic Issue Reporting System
 * 
 * Browse and search civic laws, acts, and awareness information.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { lawService } from '../../services/lawService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  BookOpen,
  Scale,
  Gavel,
  Shield,
  TreePine,
  Users,
  Car,
  Building,
  Heart,
  GraduationCap,
  Briefcase,
} from 'lucide-react';

interface Law {
  _id: string;
  lawId: string;
  title: string;
  description: string;
  content?: string;
  summary?: string;
  category: string;
  isFeatured: boolean;
  viewCount: number;
  keyPoints: string[];
  actNumber?: string;
  year?: number;
}

interface Category {
  id: string;
  name: string;
  nameTa: string;
  nameHi: string;
  icon: React.ElementType;
}

const categoryIcons: Record<string, React.ElementType> = {
  civic_rights: Users,
  municipal_laws: Building,
  environment: TreePine,
  public_safety: Shield,
  consumer_protection: Scale,
  traffic_rules: Car,
  building_regulations: Building,
  health_sanitation: Heart,
  education: GraduationCap,
  employment: Briefcase,
  other: Gavel
};

export default function LawsPage() {
  const { t, language } = useLanguage();
  const [laws, setLaws] = useState<Law[]>([]);
  const [featuredLaws, setFeaturedLaws] = useState<Law[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedLawId, setExpandedLawId] = useState<string | null>(null);

  const quickSearches = [
    { label: 'Student', query: 'education' },
    { label: 'Public', query: 'public safety' },
    { label: 'Transport', query: 'transport' },
    { label: 'Bus', query: 'bus' },
    { label: 'Women', query: 'women' },
    { label: 'Child', query: 'child' },
    { label: 'Environment', query: 'environment' },
    { label: 'Consumer', query: 'consumer' },
    { label: 'Traffic', query: 'traffic' },
    { label: 'Cyber', query: 'cyber' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [lawsData, featuredData, categoriesData] = await Promise.all([
        lawService.getLaws({ limit: 200 }),
        lawService.getFeatured(5),
        lawService.getCategories()
      ]);
      setLaws(lawsData.laws);
      setFeaturedLaws(featuredData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching laws:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    try {
      const results = await lawService.searchLaws(searchQuery);
      setLaws(results);
    } catch (error) {
      console.error('Error searching laws:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryName = (cat: Category) => {
    if (language === 'ta') return cat.nameTa;
    if (language === 'hi') return cat.nameHi;
    return cat.name;
  };

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredLaws = laws.filter((law) => {
    const matchesCategory = selectedCategory ? law.category === selectedCategory : true;
    if (!normalizedSearch) return matchesCategory;
    const searchTarget = [
      law.title,
      law.description,
      law.content,
      law.summary,
      law.actNumber,
      law.year ? String(law.year) : '',
      ...(law.keyPoints || [])
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const matchesSearch = searchTarget.includes(normalizedSearch);
    return matchesCategory && matchesSearch;
  });

  const liveSuggestions = useMemo(() => {
    if (!normalizedSearch) return [];
    const matches = laws.filter((law) => {
      const target = `${law.title} ${law.description} ${law.actNumber || ''}`.toLowerCase();
      return target.includes(normalizedSearch);
    });
    return matches.slice(0, 6);
  }, [laws, normalizedSearch]);

  const toggleExpanded = (lawId: string) => {
    setExpandedLawId((prev) => (prev === lawId ? null : lawId));
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t('laws.title')}</h1>
        <p className="text-muted-foreground">Know your rights and civic responsibilities</p>
      </div>

      {/* Search */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('laws.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
            {liveSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-10 mt-2 rounded-xl border border-border bg-card shadow-lg">
                {liveSuggestions.map((law) => (
                  <button
                    key={law._id}
                    type="button"
                    onClick={() => {
                      setSearchQuery(law.title);
                      setExpandedLawId(law._id);
                    }}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-muted"
                  >
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm font-medium">{law.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {law.actNumber ? `Act ${law.actNumber}` : law.category}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button onClick={handleSearch}>Search</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickSearches.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                setSearchQuery(item.query);
                handleSearch();
              }}
              className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-foreground transition hover:bg-muted"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
            selectedCategory === null
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          All
        </button>
        {categories.map((cat) => {
          const Icon = categoryIcons[cat.id] || Gavel;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <Icon className="w-4 h-4" />
              {getCategoryName(cat)}
            </button>
          );
        })}
      </div>

      {/* Featured Laws */}
      {!selectedCategory && !searchQuery && (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <StarIcon className="w-5 h-5" />
              Featured Laws
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))
              ) : (
                featuredLaws.map((law) => (
                  <Card key={law._id} className="h-full">
                    <CardContent className="p-4">
                      <Badge variant="secondary" className="mb-2">
                        {law.category}
                      </Badge>
                      {(law.actNumber || law.year) && (
                        <div className="mb-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {law.actNumber && <span>Act: {law.actNumber}</span>}
                          {law.year && <span>Year: {law.year}</span>}
                        </div>
                      )}
                      <h3 className="font-semibold line-clamp-2">{law.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {law.description}
                      </p>
                      {law.description && (
                        <Button
                          variant="ghost"
                          className="mt-2 h-8 px-2 text-xs"
                          onClick={() => toggleExpanded(law._id)}
                        >
                          {expandedLawId === law._id ? 'View less' : 'View more'}
                        </Button>
                      )}
                      {expandedLawId === law._id && (
                        <div className="mt-3 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                          {law.content || law.summary || law.description}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Laws */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          {selectedCategory ? 'Category Laws' : 'All Laws'}
        </h2>
        <div className="space-y-3">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))
          ) : filteredLaws.length > 0 ? (
            filteredLaws.map((law) => (
              <Card key={law._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline">{law.category}</Badge>
                        {law.isFeatured && (
                          <Badge variant="secondary">Featured</Badge>
                        )}
                        {law.actNumber && (
                          <Badge variant="outline">Act {law.actNumber}</Badge>
                        )}
                        {law.year && (
                          <Badge variant="outline">Year {law.year}</Badge>
                        )}
                      </div>
                      <h3 className="font-semibold mt-2">{law.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {law.description}
                      </p>
                      {law.keyPoints.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {law.keyPoints.slice(0, 3).map((point, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-muted px-2 py-1 rounded-full"
                            >
                              {point}
                            </span>
                          ))}
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        className="mt-2 h-8 px-2 text-xs"
                        onClick={() => toggleExpanded(law._id)}
                      >
                        {expandedLawId === law._id ? 'View less' : 'View more'}
                      </Button>
                      {expandedLawId === law._id && (
                        <div className="mt-3 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                          {law.content || law.summary || law.description}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No laws found</h3>
              <p className="text-muted-foreground">Try adjusting your search or category</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}
