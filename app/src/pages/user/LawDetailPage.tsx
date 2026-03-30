/**
 * Law Detail Page - AUREX Civic Issue Reporting System
 * 
 * Detailed view of a specific law or act.
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lawService } from '../../services/lawService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  ChevronLeft,
  BookOpen,
  Scale,
  ExternalLink,
  Share2,
  Bookmark
} from 'lucide-react';

interface Law {
  _id: string;
  lawId: string;
  title: string;
  description: string;
  content: string;
  summary?: string;
  category: string;
  keyPoints: string[];
  actNumber?: string;
  year?: number;
  isFeatured: boolean;
  viewCount: number;
  relatedLaws?: Array<{
    _id: string;
    title: string;
  }>;
}

export default function LawDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [law, setLaw] = useState<Law | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchLaw();
    }
  }, [id]);

  const fetchLaw = async () => {
    try {
      const data = await lawService.getLaw(id!);
      setLaw(data);
    } catch (error) {
      console.error('Error fetching law:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 pb-20">
        <Skeleton className="h-12" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!law) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Law not found</h2>
        <Button onClick={() => navigate('/laws')} className="mt-4">
          Back to Laws
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground font-mono">#{law.lawId}</p>
          <h1 className="text-xl font-bold line-clamp-2">{law.title}</h1>
        </div>
      </div>

      {/* Law Content */}
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Meta */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{law.category}</Badge>
            {law.isFeatured && (
              <Badge variant="secondary">Featured</Badge>
            )}
            {law.year && (
              <Badge variant="outline">Year: {law.year}</Badge>
            )}
            {law.actNumber && (
              <Badge variant="outline">Act: {law.actNumber}</Badge>
            )}
          </div>

          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground">{law.description}</p>
          </div>

          {/* Summary */}
          {law.summary && (
            <div className="p-4 bg-muted rounded-lg">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Summary
              </h2>
              <p>{law.summary}</p>
            </div>
          )}

          {/* Key Points */}
          {law.keyPoints.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Key Points</h2>
              <ul className="space-y-2">
                {law.keyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Full Content */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Full Content</h2>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p className="whitespace-pre-wrap">{law.content}</p>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <Bookmark className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Related Laws */}
      {law.relatedLaws && law.relatedLaws.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-4">Related Laws</h2>
            <div className="space-y-2">
              {law.relatedLaws.map((related) => (
                <button
                  key={related._id}
                  onClick={() => navigate(`/laws/${related._id}`)}
                  className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <p className="font-medium">{related.title}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}