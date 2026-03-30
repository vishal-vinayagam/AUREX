/**
 * Admin Laws Page - AUREX Civic Issue Reporting System
 * 
 * Manage laws, acts, and legal information.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { lawService } from '../../services/lawService';
import { useNotification } from '../../context/NotificationContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Plus,
  Search,
  BookOpen,
  Edit2,
  Trash2,
  Star
} from 'lucide-react';

interface Law {
  _id: string;
  lawId: string;
  title: string;
  category: string;
  isFeatured: boolean;
  isActive: boolean;
  viewCount: number;
  description?: string;
  content?: string;
  actNumber?: string;
  year?: number;
}

interface Category {
  id: string;
  name: string;
}

interface LawFormState {
  title: string;
  category: string;
  actNumber: string;
  year: string;
  description: string;
  summary: string;
  content: string;
  isFeatured: boolean;
  isActive: boolean;
}

const emptyFormState: LawFormState = {
  title: '',
  category: '',
  actNumber: '',
  year: '',
  description: '',
  summary: '',
  content: '',
  isFeatured: false,
  isActive: true
};

export default function AdminLawsPage() {
  const { success: showSuccess, error: showError } = useNotification();
  const [laws, setLaws] = useState<Law[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingLawId, setEditingLawId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formState, setFormState] = useState<LawFormState>(emptyFormState);

  useEffect(() => {
    fetchLaws();
    fetchCategories();
  }, []);

  const fetchLaws = async () => {
    try {
      const data = await lawService.getLaws({ limit: 200 });
      setLaws(data.laws);
    } catch (error) {
      console.error('Error fetching laws:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await lawService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await lawService.deleteLaw(id);
      showSuccess('Law deleted');
      fetchLaws();
    } catch (error) {
      showError('Failed to delete law');
    }
  };

  const handleOpenCreate = () => {
    setEditingLawId(null);
    setFormState(emptyFormState);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = async (lawId: string) => {
    try {
      const law = await lawService.getLaw(lawId);
      setEditingLawId(lawId);
      setFormState({
        title: law.title || '',
        category: law.category || '',
        actNumber: law.actNumber || '',
        year: law.year ? String(law.year) : '',
        description: law.description || '',
        summary: law.summary || '',
        content: law.content || '',
        isFeatured: !!law.isFeatured,
        isActive: law.isActive !== false
      });
      setIsDialogOpen(true);
    } catch (error) {
      showError('Failed to load law details');
    }
  };

  const handleSubmit = async () => {
    if (!formState.title.trim() || !formState.category || !formState.description.trim() || !formState.content.trim()) {
      showError('Please fill title, category, description, and full description');
      return;
    }
    setIsSubmitting(true);
    const payload = {
      title: formState.title.trim(),
      category: formState.category,
      actNumber: formState.actNumber.trim() || undefined,
      year: formState.year ? Number(formState.year) : undefined,
      description: formState.description.trim(),
      summary: formState.summary.trim() || undefined,
      content: formState.content.trim(),
      isFeatured: formState.isFeatured,
      isActive: formState.isActive
    };
    try {
      if (editingLawId) {
        await lawService.updateLaw(editingLawId, payload);
        showSuccess('Law updated');
      } else {
        await lawService.createLaw(payload);
        showSuccess('Law created');
      }
      setIsDialogOpen(false);
      fetchLaws();
    } catch (error) {
      showError('Failed to save law');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredLaws = laws.filter((law) =>
    law.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    law.lawId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCategoryLabel = useMemo(() => {
    return categories.find((cat) => cat.id === formState.category)?.name || '';
  }, [categories, formState.category]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manage Laws</h1>
          <p className="text-muted-foreground">Add, edit, and manage civic laws</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Law
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search laws..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Laws List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : filteredLaws.length > 0 ? (
            <div className="divide-y">
              {filteredLaws.map((law) => (
                <div
                  key={law._id}
                  className="flex items-center justify-between p-4 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono">
                          #{law.lawId}
                        </span>
                        {law.isFeatured && (
                          <Badge variant="secondary">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {!law.isActive && (
                          <Badge variant="destructive">Inactive</Badge>
                        )}
                      </div>
                      <p className="font-medium">{law.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {law.category}
                        {law.actNumber ? ` - Act ${law.actNumber}` : ''}
                        {law.year ? ` - ${law.year}` : ''}
                        {` - ${law.viewCount} views`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(law._id)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setConfirmDeleteId(law._id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No laws found</h3>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLawId ? 'Edit Law' : 'Add New Law'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Law Title</label>
              <Input
                value={formState.title}
                onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Enter act / law name"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={formState.category}
                  onValueChange={(value) => setFormState((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category">
                      {selectedCategoryLabel || 'Select category'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Year</label>
                <Input
                  value={formState.year}
                  onChange={(event) => setFormState((prev) => ({ ...prev, year: event.target.value }))}
                  placeholder="e.g., 2005"
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Act Number</label>
                <Input
                  value={formState.actNumber}
                  onChange={(event) => setFormState((prev) => ({ ...prev, actNumber: event.target.value }))}
                  placeholder="e.g., 22 of 2005"
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formState.isFeatured}
                    onCheckedChange={(checked) =>
                      setFormState((prev) => ({ ...prev, isFeatured: Boolean(checked) }))
                    }
                  />
                  <span className="text-sm">Featured</span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formState.isActive}
                    onCheckedChange={(checked) =>
                      setFormState((prev) => ({ ...prev, isActive: Boolean(checked) }))
                    }
                  />
                  <span className="text-sm">Active</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Short Description</label>
              <Textarea
                value={formState.description}
                onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Short, easy summary of this law"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Long Description (View More)</label>
              <Textarea
                value={formState.content}
                onChange={(event) => setFormState((prev) => ({ ...prev, content: event.target.value }))}
                placeholder="Explain in simple language"
                rows={6}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Summary (Optional)</label>
              <Textarea
                value={formState.summary}
                onChange={(event) => setFormState((prev) => ({ ...prev, summary: event.target.value }))}
                placeholder="One-paragraph summary"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Law'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* delete confirmation */}
      <Dialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <DialogContent aria-describedby="confirm-delete-desc">
          <DialogHeader>
            <DialogTitle>Confirm deletion</DialogTitle>
            <DialogDescription id="confirm-delete-desc">
              Are you sure you want to delete this law? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmDeleteId(null)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (confirmDeleteId) {
                  await handleDelete(confirmDeleteId);
                  setConfirmDeleteId(null);
                }
              }}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
