import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Users, 
  Film, 
  BarChart3, 
  Settings, 
  Shield, 
  MessageSquare, 
  CreditCard, 
  Star, 
  PlayCircle, 
  TrendingUp, 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  Bell,
  Package,
  Lock,
  Key,
  UserCheck,
  UserX,
  AlertTriangle,
  CheckCircle,
  Upload,
  Download,
  Database,
  Server,
  Zap,
  Target,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Copy,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import type { User, Content, Subscription, Payment } from "@shared/schema";

// Add this interface for episodes
interface Episode {
  id: string;
  contentId: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  description?: string;
  odyseeUrl?: string;
  releaseDate?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Types for our admin dashboard
interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  newUsersThisWeek: number;
  totalMovies: number;
  totalSeries: number;
  dailyViews: number;
  weeklyViews: number;
  activeSubscriptionsCount: number;
  activeSessions: number;
  revenue: {
    monthly: number;
    growth: number;
    totalPayments: number;
  };
  subscriptions: {
    basic: number;
    standard: number;
    premium: number;
  };
  recentActivity: {
    newMoviesAdded: number;
    newUsersToday: number;
  };
}

interface SecurityEvent {
  timestamp: Date | string; // Allow both Date and string types
  eventType: string;
  userId?: string;
  ipAddress: string;
  userAgent?: string;
  details?: string;
  severity: string;
}

function AdminDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isMountedRef = useRef(true);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fetch users data
  const { data: users, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch("/api/admin/users", {
        credentials: "include",
        headers: {
          ...(token ? { "Authorization": "Bearer " + token } : {}),
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch users");
      
      return response.json();
    },
  });

  // Fetch content data
  const { data: existingContent, isLoading: contentLoading, error: contentError } = useQuery({
    queryKey: ["/api/admin/content"],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch("/api/admin/content", {
        credentials: "include",
        headers: {
          ...(token ? { "Authorization": "Bearer " + token } : {}),
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch content");
      
      return response.json();
    },
  });

  // Fetch analytics data
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useQuery({
    queryKey: ["/api/admin/analytics"],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch("/api/admin/analytics", {
        credentials: "include",
        headers: {
          ...(token ? { "Authorization": "Bearer " + token } : {}),
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch analytics");
      
      return response.json();
    },
  });

  // Fetch security logs data
  const { data: securityLogs, isLoading: securityLogsLoading, error: securityLogsError } = useQuery({
    queryKey: ["/api/admin/security-logs"],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch("/api/admin/security-logs", {
        credentials: "include",
        headers: {
          ...(token ? { "Authorization": "Bearer " + token } : {}),
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch security logs");
      
      return response.json();
    },
  });

  // Fetch subscriptions data
  const { data: subscriptions, isLoading: subscriptionsLoading, error: subscriptionsError } = useQuery({
    queryKey: ["/api/admin/subscriptions"],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch("/api/admin/subscriptions", {
        credentials: "include",
        headers: {
          ...(token ? { "Authorization": "Bearer " + token } : {}),
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch subscriptions");
      
      return response.json();
    },
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // State for various modals and forms
  const [showAddContentDialog, setShowAddContentDialog] = useState(false);
  const [showAddVideoLinkDialog, setShowAddVideoLinkDialog] = useState(false);
  const [showEditContentDialog, setShowEditContentDialog] = useState(false);
  const [selectedContentForVideo, setSelectedContentForVideo] = useState<Content | null>(null);
  const [selectedContentForEdit, setSelectedContentForEdit] = useState<Content | null>(null);
  const [videoLinkUrl, setVideoLinkUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  
  // State for episode management
  const [showAddEpisodeDialog, setShowAddEpisodeDialog] = useState(false);
  const [showEditEpisodeDialog, setShowEditEpisodeDialog] = useState(false);
  const [selectedContentForEpisodes, setSelectedContentForEpisodes] = useState<Content | null>(null);
  const [selectedEpisodeForEdit, setSelectedEpisodeForEdit] = useState<Episode | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  
  // Content management state
  const [tmdbSearchQuery, setTmdbSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [odyseeUrl, setOdyseeUrl] = useState("");
  const [contentLanguage, setContentLanguage] = useState("vf");
  const [contentQuality, setContentQuality] = useState("hd");
  
  // Add state for user management dialog
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  
  // State for search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{movies: any[], tvShows: any[]}>({movies: [], tvShows: []});
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Add this helper function to get CSRF token
  const getCSRFToken = async (token: string | null): Promise<string | null> => {
    try {
      const response = await fetch("/api/csrf-token", {
        credentials: "include",
        headers: {
          ...(token ? { "Authorization": "Bearer " + token } : {}),
        },
      });
      if (!response.ok) {
        console.error("Failed to fetch CSRF token:", response.status, response.statusText);
        return null;
      }
      const data = await response.json();
      return data.csrfToken || null;
    } catch (error) {
      console.error("Error fetching CSRF token:", error);
      return null;
    }
  };

  // Fetch episodes for a TV series
  const fetchEpisodes = async (contentId: string) => {
    if (!contentId) return;
    
    setLoadingEpisodes(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/episodes/${contentId}`, {
        credentials: "include",
        headers: {
          ...(token ? { "Authorization": "Bearer " + token } : {}),
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch episodes");
      
      const data = await response.json();
      setEpisodes(data.episodes || []);
    } catch (error) {
      console.error("Error fetching episodes:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les épisodes : " + (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoadingEpisodes(false);
    }
  };

  // Handle viewing episodes for a TV series
  const handleViewEpisodes = (content: Content) => {
    if (content.mediaType !== 'tv') {
      toast({
        title: "Erreur",
        description: "Cette fonctionnalité est uniquement disponible pour les séries TV.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedContentForEpisodes(content);
    fetchEpisodes(content.id);
    setShowAddEpisodeDialog(true);
  };

  // Mutation for creating episodes
  const createEpisodeMutation = useMutation({
    mutationFn: async (data: Partial<Episode>) => {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error("Vous devez être connecté pour effectuer cette action");
      
      const csrfToken = await getCSRFToken(token);
      if (!csrfToken) throw new Error("Impossible d'obtenir le jeton de sécurité");
      
      const response = await fetch("/api/admin/episodes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contents/tmdb"] });
      setShowAddVideoLinkDialog(false);
      setVideoLinkUrl("");
      setSelectedContentForVideo(null);
      toast({
        title: "Lien vidéo ajouté",
        description: "Le lien vidéo a été ajouté avec succès au contenu.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le lien vidéo.",
        variant: "destructive",
      });
    },
  });

  // Handle adding video link to content
  const handleAddVideoLink = (content: Content) => {
    setSelectedContentForVideo(content);
    setShowAddVideoLinkDialog(true);
  };

  // Submit video link form
  const handleSubmitVideoLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContentForVideo) {
      toast({
        title: "Erreur",
        description: "Aucun contenu sélectionné.",
        variant: "destructive",
      });
      return;
    }
    
    // Decode any HTML entities in the URL before sending to the server
    let cleanVideoUrl = videoLinkUrl;
    const textArea = document.createElement('textarea');
    textArea.innerHTML = videoLinkUrl;
    cleanVideoUrl = textArea.value;
    
    addVideoLinkMutation.mutate({
      tmdbId: selectedContentForVideo.tmdbId,
      videoUrl: cleanVideoUrl
    });
  };

  // Handle editing content
  const handleEditContent = (content: Content) => {
    setSelectedContentForEdit(content);
    setShowEditContentDialog(true);
  };

  // Handle updating content
  const handleUpdateContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContentForEdit) {
      toast({
        title: "Erreur",
        description: "Aucun contenu sélectionné.",
        variant: "destructive",
      });
      return;
    }
    
    // Get form data
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Extract values from form
    const title = (form.querySelector('#title') as HTMLInputElement)?.value;
    const language = (form.querySelector('#language') as HTMLSelectElement)?.value;
    const quality = (form.querySelector('#quality') as HTMLSelectElement)?.value;
    const mediaType = (form.querySelector('#media-type') as HTMLSelectElement)?.value;
    const description = (form.querySelector('#description') as HTMLTextAreaElement)?.value;
    const genres = (form.querySelector('#genres') as HTMLInputElement)?.value;
    const releaseDate = (form.querySelector('#release-date') as HTMLInputElement)?.value;
    const posterPath = (form.querySelector('#poster-path') as HTMLInputElement)?.value;
    const backdropPath = (form.querySelector('#backdrop-path') as HTMLInputElement)?.value;
    const odyseeUrl = (form.querySelector('#odysee-url') as HTMLInputElement)?.value;
    const active = (form.querySelector('#active') as HTMLInputElement)?.checked;
    
    // Decode any HTML entities in the URL before sending to the server
    let cleanOdyseeUrl = odyseeUrl;
    if (odyseeUrl) {
      const textArea = document.createElement('textarea');
      textArea.innerHTML = odyseeUrl;
      cleanOdyseeUrl = textArea.value;
    }
    
    // Prepare updates object
    const updates: Partial<Content> = {
      title: title || undefined,
      language: language || undefined,
      quality: quality || undefined,
      mediaType: mediaType || undefined,
      description: description || undefined,
      releaseDate: releaseDate || undefined,
      posterPath: posterPath || undefined,
      backdropPath: backdropPath || undefined,
      odyseeUrl: cleanOdyseeUrl || undefined,
      active: active !== undefined ? active : undefined,
    };
    
    // Handle genres
    if (genres) {
      updates.genres = genres.split(',').map(g => g.trim()).filter(g => g.length > 0);
    }
    
    editContentMutation.mutate({
      contentId: selectedContentForEdit.id,
      updates
    });
  };

  // Handle searching for content
  const handleSearchContent = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un terme de recherche.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSearching(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error("Vous devez être connecté pour effectuer cette action");
      
      const csrfToken = await getCSRFToken(token);
      if (!csrfToken) throw new Error("Impossible d'obtenir le jeton de sécurité");
      
      const response = await fetch("/api/admin/search-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ query: searchQuery }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      setSearchResults({
        movies: result.movies || [],
        tvShows: result.tvShows || []
      });
      setShowSearchResults(true);
      
      toast({
        title: "Recherche terminée",
        description: `Trouvé ${result.movies?.length || 0} films et ${result.tvShows?.length || 0} séries.`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de rechercher le contenu.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Handle importing specific content
  const handleImportSpecificContent = async (tmdbId: number, mediaType: string, title: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir importer "${title}" ?`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error("Vous devez être connecté pour effectuer cette action");
      
      const csrfToken = await getCSRFToken(token);
      if (!csrfToken) throw new Error("Impossible d'obtenir le jeton de sécurité");
      
      const response = await fetch("/api/admin/import-content-by-id", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ tmdbId, mediaType }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      toast({
        title: "Import réussi",
        description: result.message,
      });
      
      // Refresh content list
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
      setShowSearchResults(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'importer le contenu.",
        variant: "destructive",
      });
    }
  };

  // Handle importing content from TMDB
  const handleImportContent = async () => {
    setIsImporting(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error("Vous devez être connecté pour effectuer cette action");
      
      const csrfToken = await getCSRFToken(token);
      if (!csrfToken) throw new Error("Impossible d'obtenir le jeton de sécurité");
      
      const response = await fetch("/api/admin/import-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      toast({
        title: "Import réussi",
        description: `Contenu importé avec succès: ${result.moviesAdded} films et ${result.tvShowsAdded} séries ajoutés.`,
      });
      
      // Refresh content list
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'importer le contenu.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Mutation for creating new content
  const createContentMutation = useMutation({
    mutationFn: async (data: Partial<Content>) => {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error("Vous devez être connecté pour effectuer cette action");
      
      const csrfToken = await getCSRFToken(token);
      if (!csrfToken) throw new Error("Impossible d'obtenir le jeton de sécurité");
      
      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contents/tmdb"] });
      setShowAddContentDialog(false);
      toast({
        title: "Contenu ajouté",
        description: "Le contenu a été ajouté avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le contenu.",
        variant: "destructive",
      });
    },
  });

  // Mutation for editing content
  const editContentMutation = useMutation({
    mutationFn: async (data: { contentId: string; updates: Partial<Content> }) => {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error("Vous devez être connecté pour effectuer cette action");
      
      const csrfToken = await getCSRFToken(token);
      if (!csrfToken) throw new Error("Impossible d'obtenir le jeton de sécurité");
      
      const response = await fetch(`/api/admin/content/${data.contentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(data.updates),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
      setShowEditContentDialog(false);
      setSelectedContentForEdit(null);
      toast({
        title: "Contenu mis à jour",
        description: "Le contenu a été mis à jour avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le contenu.",
        variant: "destructive",
      });
    },
  });

  // Mutation for adding video link to content
  const addVideoLinkMutation = useMutation({
    mutationFn: async (data: { tmdbId: number; videoUrl: string }) => {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error("Vous devez être connecté pour effectuer cette action");
      
      const csrfToken = await getCSRFToken(token);
      if (!csrfToken) throw new Error("Impossible d'obtenir le jeton de sécurité");
      
      const response = await fetch("/api/admin/video-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
      setShowAddVideoLinkDialog(false);
      setVideoLinkUrl("");
      setSelectedContentForVideo(null);
      toast({
        title: "Lien vidéo ajouté",
        description: "Le lien vidéo a été ajouté avec succès au contenu.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le lien vidéo.",
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting content
  const deleteContentMutation = useMutation({
    mutationFn: async (contentId: string) => {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error("Vous devez être connecté pour effectuer cette action");
      
      const csrfToken = await getCSRFToken(token);
      if (!csrfToken) throw new Error("Impossible d'obtenir le jeton de sécurité");
      
      const response = await fetch(`/api/admin/content/${contentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
      toast({
        title: "Contenu supprimé",
        description: "Le contenu a été supprimé avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le contenu.",
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting users
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error("Vous devez être connecté pour effectuer cette action");
      
      const csrfToken = await getCSRFToken(token);
      if (!csrfToken) throw new Error("Impossible d'obtenir le jeton de sécurité");
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'utilisateur.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 bottom-0 w-64 bg-background ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="flex flex-col h-full">
          <div className="p-4">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex-1">
            <ul className="space-y-2">
              <li>
                <button className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100" onClick={() => setActiveTab("dashboard")}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dashboard
                </button>
              </li>
              <li>
                <button className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100" onClick={() => setActiveTab("content")}>
                  <Film className="w-4 h-4 mr-2" />
                  Contenu
                </button>
              </li>
              <li>
                <button className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100" onClick={() => setActiveTab("users")}>
                  <Users className="w-4 h-4 mr-2" />
                  Utilisateurs
                </button>
              </li>
              <li>
                <button className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100" onClick={() => setActiveTab("security")}>
                  <Shield className="w-4 h-4 mr-2" />
                  Sécurité
                </button>
              </li>
              <li>
                <button className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100" onClick={() => setActiveTab("settings")}>
                  <Settings className="w-4 h-4 mr-2" />
                  Paramètres
                </button>
              </li>
            </ul>
          </div>
          <div className="p-4">
            <button className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {sidebarOpen ? "Fermer" : "Ouvrir"}
            </button>
          </div>
        </div>
      </aside>
      {/* Main content */}
      <main className={`flex-1 p-4 ${sidebarOpen ? "ml-64" : ""}`}>
        <Tabs defaultValue={activeTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="content">Contenu</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Utilisateurs</CardTitle>
                  <CardDescription>Statistiques des utilisateurs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-100">
                      <Users className="w-12 h-12 mb-2" />
                      <span className="text-2xl font-bold">{analytics?.totalUsers}</span>
                      <span className="text-gray-500">Utilisateurs totaux</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-100">
                      <Users className="w-12 h-12 mb-2" />
                      <span className="text-2xl font-bold">{analytics?.activeUsers}</span>
                      <span className="text-gray-500">Utilisateurs actifs</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-100">
                      <Users className="w-12 h-12 mb-2" />
                      <span className="text-2xl font-bold">{analytics?.newUsersThisWeek}</span>
                      <span className="text-gray-500">Nouveaux utilisateurs cette semaine</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Contenu</CardTitle>
                  <CardDescription>Statistiques sur le contenu</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-100">
                      <Film className="w-12 h-12 mb-2" />
                      <span className="text-2xl font-bold">{analytics?.totalMovies}</span>
                      <span className="text-gray-500">Films</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-100">
                      <Film className="w-12 h-12 mb-2" />
                      <span className="text-2xl font-bold">{analytics?.totalSeries}</span>
                      <span className="text-gray-500">Séries</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Revenus</CardTitle>
                  <CardDescription>Statistiques sur les revenus</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-100">
                      <CreditCard className="w-12 h-12 mb-2" />
                      <span className="text-2xl font-bold">${analytics?.revenue.monthly}</span>
                      <span className="text-gray-500">Revenus mensuels</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-100">
                      <TrendingUp className="w-12 h-12 mb-2" />
                      <span className="text-2xl font-bold">{analytics?.revenue.growth}%</span>
                      <span className="text-gray-500">Croissance</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-100">
                      <MessageSquare className="w-12 h-12 mb-2" />
                      <span className="text-2xl font-bold">{analytics?.revenue.totalPayments}</span>
                      <span className="text-gray-500">Paiements totaux</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Sécurité</CardTitle>
                  <CardDescription>Derniers événements de sécurité</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    {securityLogs?.map((log, index) => (
                      <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-100" key={index}>
                        <Shield className="w-12 h-12 mb-2" />
                        <span className="text-lg font-bold">{log.eventType}</span>
                        <span className="text-gray-500">{log.details}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Activité récente</CardTitle>
                  <CardDescription>Activité récente sur le site</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-100">
                      <Film className="w-12 h-12 mb-2" />
                      <span className="text-2xl font-bold">{analytics?.recentActivity.newMoviesAdded}</span>
                      <span className="text-gray-500">Nouveaux films ajoutés</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-100">
                      <Users className="w-12 h-12 mb-2" />
                      <span className="text-2xl font-bold">{analytics?.recentActivity.newUsersToday}</span>
                      <span className="text-gray-500">Nouveaux utilisateurs aujourd'hui</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="content">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion du contenu</CardTitle>
                  <CardDescription>Ajoutez, modifiez ou supprimez du contenu</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button onClick={() => setShowAddContentDialog(true)}>Ajouter du contenu</Button>
                    <Button onClick={() => setTmdbSearchQuery("")}>Importer du contenu</Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Liste du contenu</CardTitle>
                  <CardDescription>Votre bibliothèque de contenu</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    {existingContent?.map((content) => (
                      <div className="flex items-center justify-between p-4 rounded-lg bg-gray-100" key={content.id}>
                        <div>
                          <h3 className="text-lg font-bold">{content.title}</h3>
                          <p className="text-gray-500">{content.description}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="secondary" onClick={() => handleEditContent(content)}>Modifier</Button>
                          <Button variant="destructive" onClick={() => deleteContentMutation.mutate(content.id)}>Supprimer</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Importation de contenu</CardTitle>
                  <CardDescription>Recherchez et importez du contenu depuis TMDB</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <Input
                      type="text"
                      placeholder="Recherchez par titre"
                      value={tmdbSearchQuery}
                      onChange={(e) => setTmdbSearchQuery(e.target.value)}
                    />
                    <Button onClick={handleImportContent} disabled={isImporting}>
                      {isImporting ? "Importation..." : "Importer tout le contenu"}
                    </Button>
                    {selectedMovie && (
                      <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-100">
                        <h3 className="text-lg font-bold">{selectedMovie.title}</h3>
                        <p className="text-gray-500">{selectedMovie.overview}</p>
                        <Button onClick={() => handleImportSpecificContent(selectedMovie.id, selectedMovie.media_type, selectedMovie.title)}>Importer ce contenu</Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="users">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion des utilisateurs</CardTitle>
                  <CardDescription>Ajoutez, modifiez ou supprimez des utilisateurs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <Input
                      type="text"
                      placeholder="Recherchez par nom d'utilisateur"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button onClick={handleSearchContent} disabled={isSearching}>
                      {isSearching ? "Recherche..." : "Rechercher"}
                    </Button>
                    <div className="grid grid-cols-1 gap-4">
                      {users?.map((user) => (
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-100" key={user.id}>
                          <div>
                            <h3 className="text-lg font-bold">{user.username}</h3>
                            <p className="text-gray-500">{user.email}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="secondary" onClick={() => handleEditUser(user)}>Modifier</Button>
                            <Button variant="destructive" onClick={() => deleteUserMutation.mutate(user.id)}>Supprimer</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="security">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion de la sécurité</CardTitle>
                  <CardDescription>Gérez les événements de sécurité</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    {securityLogs?.map((log, index) => (
                      <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-100" key={index}>
                        <Shield className="w-12 h-12 mb-2" />
                        <span className="text-lg font-bold">{log.eventType}</span>
                        <span className="text-gray-500">{log.details}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="settings">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres du site</CardTitle>
                  <CardDescription>Gérez les paramètres du site</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <p>Paramètres du site en cours de développement...</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default AdminDashboard;

  const editContentMutation = useMutation({
    mutationFn: async (data: { contentId: string; updates: Partial<Content> }) => {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error("Vous devez être connecté pour effectuer cette action");
      
      const csrfToken = await getCSRFToken(token);
      if (!csrfToken) throw new Error("Impossible d'obtenir le jeton de sécurité");
      
      const response = await fetch(`/api/admin/content/${data.contentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(data.updates),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contents/tmdb"] });
      setShowEditContentDialog(false);
      setSelectedContentForEdit(null);
      toast({
        title: "Contenu mis à jour",
        description: "Le contenu a été mis à jour avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le contenu.",
        variant: "destructive",
      });
    },
  });

  // Mutation for adding video links to existing content
  const addVideoLinkMutation = useMutation({
    mutationFn: async (data: { tmdbId: number; videoUrl: string }) => {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error("Vous devez être connecté pour effectuer cette action");
      
      const csrfToken = await getCSRFToken(token);
      if (!csrfToken) throw new Error("Impossible d'obtenir le jeton de sécurité");
      
      const response = await fetch("/api/contents/add-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contents/tmdb"] });
      setShowAddVideoLinkDialog(false);
      setVideoLinkUrl("");
      setSelectedContentForVideo(null);
      toast({
        title: "Lien vidéo ajouté",
        description: "Le lien vidéo a été ajouté avec succès au contenu.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le lien vidéo.",
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting content
  const deleteContentMutation = useMutation({
    mutationFn: async (contentId: string) => {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error("Vous devez être connecté pour effectuer cette action");
      
      const csrfToken = await getCSRFToken(token);
      if (!csrfToken) throw new Error("Impossible d'obtenir le jeton de sécurité");
      
      const response = await fetch(`/api/admin/content/${contentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
      toast({
        title: "Contenu supprimé",
        description: "Le contenu a été supprimé avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le contenu.",
        variant: "destructive",
      });
    },
  });

  // Sidebar menu items
  const menuItems = [
    { id: "dashboard", label: "Tableau de Bord", icon: BarChart3 },
    { id: "content", label: "Gestion Contenus", icon: Film },
    { id: "users", label: "Utilisateurs", icon: Users },
    { id: "subscriptions", label: "Abonnements", icon: CreditCard },
    { id: "analytics", label: "Statistiques", icon: TrendingUp },
    { id: "security", label: "Sécurité", icon: Shield },
    { id: "settings", label: "Paramètres", icon: Settings },
  ];

  // Function to handle editing a user
  const handleEditUser = (user: User) => {
    setSelectedUserForEdit(user);
    setShowEditUserDialog(true);
  };

  // Function to handle suspending a user
  const handleSuspendUser = (userId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir suspendre cet utilisateur ?")) {
      suspendUserMutation.mutate(userId);
    }
  };

  // Function to handle deleting a user
  const handleDeleteUser = (userId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) {
      deleteUserMutation.mutate(userId);
    }
  };

  // Function to handle banning a user
  const handleBanUser = (userId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir bannir cet utilisateur ? Cette action est irréversible.")) {
      banUserMutation.mutate(userId);
    }
  };

  // Function to handle updating a user
  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) {
      toast({
        title: "Erreur",
        description: "Aucun utilisateur sélectionné.",
        variant: "destructive",
      });
      return;
    }
    
    const form = e.target as HTMLFormElement;
    const username = (form.querySelector('#edit-username') as HTMLInputElement)?.value;
    const email = (form.querySelector('#edit-email') as HTMLInputElement)?.value;
    const role = (form.querySelector('#edit-role') as HTMLSelectElement)?.value;
    
    editUserMutation.mutate({
      userId: selectedUserForEdit.id,
      updates: {
        username: username || undefined,
        email: email || undefined,
        role: role || undefined,
      }
    });
    
    setShowEditUserDialog(false);
    setSelectedUserForEdit(null);
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
            <CardTitle>Accès refusé</CardTitle>
            <CardDescription>
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={`bg-card border-r transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
        <div className="flex items-center justify-between p-4 border-b">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">Admin</span>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <MenuIcon />
          </Button>
        </div>
        
        <nav className="p-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className={`w-full justify-start mb-1 ${sidebarOpen ? '' : 'justify-center'}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon className="h-4 w-4" />
                {sidebarOpen && <span className="ml-2">{item.label}</span>}
              </Button>
            );
          })}
        </nav>
import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Users, 
  Film, 
  BarChart3, 
  Settings, 
  Shield, 
  MessageSquare, 
  CreditCard, 
  Star, 
  PlayCircle, 
  TrendingUp, 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  Bell,
  Package,
  Lock,
  Key,
  UserCheck,
  UserX,
  AlertTriangle,
  CheckCircle,
  Upload,
  Download,
  Database,
  Server,
  Zap,
  Target,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Copy,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import type { User, Content, Subscription, Payment } from "@shared/schema";

// Add this interface for episodes
interface Episode {
  id: string;
  contentId: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  description?: string;
  odyseeUrl?: string;
  releaseDate?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Types for our admin dashboard
interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  newUsersThisWeek: number;
  totalMovies: number;
  totalSeries: number;
  dailyViews: number;
  weeklyViews: number;
  activeSubscriptionsCount: number;
  activeSessions: number;
  revenue: {
    monthly: number;
    growth: number;
    totalPayments: number;
  };
  subscriptions: {
    basic: number;
    standard: number;
    premium: number;
  };
  recentActivity: {
    newMoviesAdded: number;
    newUsersToday: number;
  };
}

interface SecurityEvent {
  timestamp: Date | string; // Allow both Date and string types
  eventType: string;
  userId?: string;
  ipAddress: string;
  userAgent?: string;
  details?: string;
  severity: string;
}

function AdminDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isMountedRef = useRef(true);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fetch users data
  const { data: users, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch("/api/admin/users", {
        credentials: "include",
        headers: {
          ...(token ? { "Authorization": "Bearer " + token } : {}),
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch users");
      
      return response.json();
    },
  });

  // Fetch content data
  const { data: existingContent, isLoading: contentLoading, error: contentError } = useQuery({
    queryKey: ["/api/admin/content"],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch("/api/admin/content", {
        credentials: "include",
        headers: {
          ...(token ? { "Authorization": "Bearer " + token } : {}),
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch content");
      
      return response.json();
    },
  });

  // Fetch analytics data
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useQuery({
    queryKey: ["/api/admin/analytics"],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch("/api/admin/analytics", {
        credentials: "include",
        headers: {
          ...(token ? { "Authorization": "Bearer " + token } : {}),
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch analytics");
      
      return response.json();
    },
  });

  // Fetch security logs data
  const { data: securityLogs, isLoading: securityLogsLoading, error: securityLogsError } = useQuery({
    queryKey: ["/api/admin/security-logs"],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch("/api/admin/security-logs", {
        credentials: "include",
        headers: {
          ...(token ? { "Authorization": "Bearer " + token } : {}),
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch security logs");
      
      return response.json();
    },
  });

  // Fetch subscriptions data
  const { data: subscriptions, isLoading: subscriptionsLoading, error: subscriptionsError } = useQuery({
    queryKey: ["/api/admin/subscriptions"],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch("/api/admin/subscriptions", {
        credentials: "include",
        headers: {
          ...(token ? { "Authorization": "Bearer " + token } : {}),
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch subscriptions");
      
      return response.json();
    },
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // State for various modals and forms
  const [showAddContentDialog, setShowAddContentDialog] = useState(false);
  const [showAddVideoLinkDialog, setShowAddVideoLinkDialog] = useState(false);
  const [showEditContentDialog, setShowEditContentDialog] = useState(false);
  const [selectedContentForVideo, setSelectedContentForVideo] = useState<Content | null>(null);
  const [selectedContentForEdit, setSelectedContentForEdit] = useState<Content | null>(null);
  const [videoLinkUrl, setVideoLinkUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  
  // State for episode management
  const [showAddEpisodeDialog, setShowAddEpisodeDialog] = useState(false);
  const [showEditEpisodeDialog, setShowEditEpisodeDialog] = useState(false);
  const [selectedContentForEpisodes, setSelectedContentForEpisodes] = useState<Content | null>(null);
  const [selectedEpisodeForEdit, setSelectedEpisodeForEdit] = useState<Episode | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  
  // Content management state
  const [tmdbSearchQuery, setTmdbSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [odyseeUrl, setOdyseeUrl] = useState("");
  const [contentLanguage, setContentLanguage] = useState("vf");
  const [contentQuality, setContentQuality] = useState("hd");
  
  // Add state for user management dialog
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  
  // State for search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{movies: any[], tvShows: any[]}>({movies: [], tvShows: []});
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Add this helper function to get CSRF token
  const getCSRFToken = async (token: string | null): Promise<string | null> => {
    try {
      const response = await fetch("/api/csrf-token", {
        credentials: "include",
        headers: {
          ...(token ? { "Authorization": "Bearer " + token } : {}),
        },
      });
      if (!response.ok) {
        console.error("Failed to fetch CSRF token:", response.status, response.statusText);
        return null;
      }
      const data = await response.json();
      return data.csrfToken || null;
    } catch (error) {
      console.error("Error fetching CSRF token:", error);
      return null;
    }
  };

  // Fetch episodes for a TV series
  const fetchEpisodes = async (contentId: string) => {
    if (!contentId) return;
    
    setLoadingEpisodes(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/episodes/${contentId}`, {
        credentials: "include",
        headers: {
          ...(token ? { "Authorization": "Bearer " + token } : {}),
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch episodes");
      
      const data = await response.json();
      setEpisodes(data.episodes || []);
    } catch (error) {
      console.error("Error fetching episodes:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les épisodes : " + (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoadingEpisodes(false);
    }
  };

  // Handle viewing episodes for a TV series
  const handleViewEpisodes = (content: Content) => {
    if (content.mediaType !== 'tv') {
      toast({
        title: "Erreur",
        description: "Cette fonctionnalité est uniquement disponible pour les séries TV.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedContentForEpisodes(content);
    fetchEpisodes(content.id);
    setShowAddEpisodeDialog(true);
  };

  // Mutation for creating episodes
  const createEpisodeMutation = useMutation({
    mutationFn: async (data: Partial<Episode>) => {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error("Vous devez être connecté pour effectuer cette action");
      
      const csrfToken = await getCSRFToken(token);
      if (!csrfToken) throw new Error("Impossible d'obtenir le jeton de sécurité");
      
      const response = await fetch("/api/admin/episodes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contents/tmdb"] });
      setShowAddVideoLinkDialog(false);
      setVideoLinkUrl("");
      setSelectedContentForVideo(null);
      toast({
        title: "Lien vidéo ajouté",
        description: "Le lien vidéo a été ajouté avec succès au contenu.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le lien vidéo.",
        variant: "destructive",
      });
    },
  });

  // Handle adding video link to content
  const handleAddVideoLink = (content: Content) => {
    setSelectedContentForVideo(content);
    setShowAddVideoLinkDialog(true);
  };

  // Submit video link form
  const handleSubmitVideoLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContentForVideo) {
      toast({
        title: "Erreur",
        description: "Aucun contenu sélectionné.",
        variant: "destructive",
      });
      return;
    }
    
    // Decode any HTML entities in the URL before sending to the server
    let cleanVideoUrl = videoLinkUrl;
    const textArea = document.createElement('textarea');
    textArea.innerHTML = videoLinkUrl;
    cleanVideoUrl = textArea.value;
    
    addVideoLinkMutation.mutate({
      tmdbId: selectedContentForVideo.tmdbId,
      videoUrl: cleanVideoUrl
    });
  };

  // Handle editing content
  const handleEditContent = (content: Content) => {
    setSelectedContentForEdit(content);
    setShowEditContentDialog(true);
  };

  // Handle updating content
  const handleUpdateContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContentForEdit) {
      toast({
        title: "Erreur",
        description: "Aucun contenu sélectionné.",
        variant: "destructive",
      });
      return;
    }
    
    // Get form data
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Extract values from form
    const title = (form.querySelector('#title') as HTMLInputElement)?.value;
    const language = (form.querySelector('#language') as HTMLSelectElement)?.value;
    const quality = (form.querySelector('#quality') as HTMLSelectElement)?.value;
    const mediaType = (form.querySelector('#media-type') as HTMLSelectElement)?.value;
    const description = (form.querySelector('#description') as HTMLTextAreaElement)?.value;
    const genres = (form.querySelector('#genres') as HTMLInputElement)?.value;
    const releaseDate = (form.querySelector('#release-date') as HTMLInputElement)?.value;
    const posterPath = (form.querySelector('#poster-path') as HTMLInputElement)?.value;
    const backdropPath = (form.querySelector('#backdrop-path') as HTMLInputElement)?.value;
    const odyseeUrl = (form.querySelector('#odysee-url') as HTMLInputElement)?.value;
    const active = (form.querySelector('#active') as HTMLInputElement)?.checked;
    
    // Decode any HTML entities in the URL before sending to the server
    let cleanOdyseeUrl = odyseeUrl;
    if (odyseeUrl) {
      const textArea = document.createElement('textarea');
      textArea.innerHTML = odyseeUrl;
      cleanOdyseeUrl = textArea.value;
    }
    
    // Prepare updates object
    const updates: Partial<Content> = {
      title: title || undefined,
      language: language || undefined,
      quality: quality || undefined,
      mediaType: mediaType || undefined,
      description: description || undefined,
      releaseDate: releaseDate || undefined,
      posterPath: posterPath || undefined,
      backdropPath: backdropPath || undefined,
      odyseeUrl: cleanOdyseeUrl || undefined,
      active: active !== undefined ? active : undefined,
    };
    
    // Handle genres
    if (genres) {
      updates.genres = genres.split(',').map(g => g.trim()).filter(g => g.length > 0);
    }
    
    editContentMutation.mutate({
      contentId: selectedContentForEdit.id,
      updates
    });
  };

  // Handle searching for content
  const handleSearchContent = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un terme de recherche.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSearching(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error("Vous devez être connecté pour effectuer cette action");
      
      const csrfToken = await getCSRFToken(token);
      if (!csrfToken) throw new Error("Impossible d'obtenir le jeton de sécurité");
      
      const response = await fetch("/api/admin/search-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ query: searchQuery }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      setSearchResults({
        movies: result.movies || [],
        tvShows: result.tvShows || []
      });
      setShowSearchResults(true);
      
      toast({
        title: "Recherche terminée",
        description: `Trouvé ${result.movies?.length || 0} films et ${result.tvShows?.length || 0} séries.`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de rechercher le contenu.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Handle importing specific content
  const handleImportSpecificContent = async (tmdbId: number, mediaType: string, title: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir importer "${title}" ?`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error("Vous devez être connecté pour effectuer cette action");
      
      const csrfToken = await getCSRFToken(token);
      if (!csrfToken) throw new Error("Impossible d'obtenir le jeton de sécurité");
      
      const response = await fetch("/api/admin/import-content-by-id", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ tmdbId, mediaType }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      toast({
        title: "Import réussi",
        description: result.message,
      });
      
      // Refresh content list
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
      setShowSearchResults(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'importer le contenu.",
        variant: "destructive",
      });
    }
  };

  // Handle importing content from TMDB
  const handleImportContent = async () => {
    setIsImporting(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error("Vous devez être connecté pour effectuer cette action");
      
      const csrfToken = await getCSRFToken(token);
      if (!csrfToken) throw new Error("Impossible d'obtenir le jeton de sécurité");
      
      const response = await fetch("/api/admin/import-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      toast({
        title: "Import réussi",
        description: `Contenu importé avec succès: ${result.moviesAdded} films et ${result.tvShowsAdded} séries ajoutés.`,
      });
      
      // Refresh content list
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'importer le contenu.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Mutation for creating new content
  const createContentMutation = useMutation({
    mutationFn: async (data: Partial<Content>) => {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error("Vous devez être connecté pour effectuer cette action");
      
      const csrfToken = await getCSRFToken(token);
      if (!csrfToken) throw new Error("Impossible d'obtenir le jeton de sécurité");
      
      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contents/tmdb"] });
      setShowAddContentDialog(false);
      toast({
        title: "Contenu ajouté",
        description: "Le contenu a été ajouté avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le contenu.",
        variant: "destructive",
      });
    },
  });

  // Mutation for editing content
  const editContentMutation = useMutation({
    mutationFn: async (data: { contentId: string; updates: Partial<Content> }) => {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error("Vous devez être connecté pour effectuer cette action");
      
      const csrfToken = await getCSRFToken(token);
      if (!csrfToken) throw new Error("Impossible d'obtenir le jeton de sécurité");
      
      const response = await fetch(`/api/admin/content/${data.contentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(data.updates),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
      setShowEditContentDialog(false);
      setSelectedContentForEdit(null);
      toast({
        title: "Contenu mis à jour",
        description: "Le contenu a été mis à jour avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le contenu.",
        variant: "destructive",
      });
    },
  });

  // Mutation for adding video link to content
  const addVideoLinkMutation = useMutation({
    mutationFn: async (data: { tmdbId: number; videoUrl: string }) => {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error("Vous devez être connecté pour effectuer cette action");
      
      const csrfToken = await getCSRFToken(token);
      if (!csrfToken) throw new Error("Impossible d'obtenir le jeton de sécurité");
      
      const response = await fetch("/api/admin/video-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
      setShowAddVideoLinkDialog(false);
      setVideoLinkUrl("");
      setSelectedContentForVideo(null);
      toast({
        title: "Lien vidéo ajouté",
        description: "Le lien vidéo a été ajouté avec succès au contenu.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le lien vidéo.",
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting content
  const deleteContentMutation = useMutation({
    mutationFn: async (contentId: string) => {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error("Vous devez être connecté pour effectuer cette action");
      
      const csrfToken = await getCSRFToken(token);
      if (!csrfToken) throw new Error("Impossible d'obtenir le jeton de sécurité");
      
      const response = await fetch(`/api/admin/content/${contentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
      toast({
        title: "Contenu supprimé",
        description: "Le contenu a été supprimé avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le contenu.",
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting users
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error("Vous devez être connecté pour effectuer cette action");
      
      const csrfToken = await getCSRFToken(token);
      if (!csrfToken) throw new Error("Impossible d'obtenir le jeton de sécurité");
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'utilisateur.",
        variant: "destructive",
      });
    },
  });

}

export default AdminDashboard;

  const editContentMutation = useMutation({
    mutationFn: async (data: { contentId: string; updates: Partial<Content> }) => {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error("Vous devez être connecté pour effectuer cette action");
      
      const csrfToken = await getCSRFToken(token);
      if (!csrfToken) throw new Error("Impossible d'obtenir le jeton de sécurité");
      
      const response = await fetch(`/api/admin/content/${data.contentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(data.updates),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contents/tmdb"] });
      setShowEditContentDialog(false);
      setSelectedContentForEdit(null);
      toast({
        title: "Contenu mis à jour",
        description: "Le contenu a été mis à jour avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le contenu.",
        variant: "destructive",
      });
    },
  });

  // Mutation for adding video links to existing content
  const addVideoLinkMutation = useMutation({
    mutationFn: async (data: { tmdbId: number; videoUrl: string }) => {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error("Vous devez être connecté pour effectuer cette action");
      
      const csrfToken = await getCSRFToken(token);
      if (!csrfToken) throw new Error("Impossible d'obtenir le jeton de sécurité");
      
      const response = await fetch("/api/contents/add-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contents/tmdb"] });
      setShowAddVideoLinkDialog(false);
      setVideoLinkUrl("");
      setSelectedContentForVideo(null);
      toast({
        title: "Lien vidéo ajouté",
        description: "Le lien vidéo a été ajouté avec succès au contenu.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le lien vidéo.",
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting content
  const deleteContentMutation = useMutation({
    mutationFn: async (contentId: string) => {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error("Vous devez être connecté pour effectuer cette action");
      
      const csrfToken = await getCSRFToken(token);
      if (!csrfToken) throw new Error("Impossible d'obtenir le jeton de sécurité");
      
      const response = await fetch(`/api/admin/content/${contentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
      toast({
        title: "Contenu supprimé",
        description: "Le contenu a été supprimé avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le contenu.",
        variant: "destructive",
      });
    },
  });

  // Sidebar menu items
  const menuItems = [
    { id: "dashboard", label: "Tableau de Bord", icon: BarChart3 },
    { id: "content", label: "Gestion Contenus", icon: Film },
    { id: "users", label: "Utilisateurs", icon: Users },
    { id: "subscriptions", label: "Abonnements", icon: CreditCard },
    { id: "analytics", label: "Statistiques", icon: TrendingUp },
    { id: "security", label: "Sécurité", icon: Shield },
    { id: "settings", label: "Paramètres", icon: Settings },
  ];

  // Function to handle editing a user
  const handleEditUser = (user: User) => {
    setSelectedUserForEdit(user);
    setShowEditUserDialog(true);
  };

  // Function to handle suspending a user
  const handleSuspendUser = (userId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir suspendre cet utilisateur ?")) {
      suspendUserMutation.mutate(userId);
    }
  };

  // Function to handle deleting a user
  const handleDeleteUser = (userId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) {
      deleteUserMutation.mutate(userId);
    }
  };

  // Function to handle banning a user
  const handleBanUser = (userId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir bannir cet utilisateur ? Cette action est irréversible.")) {
      banUserMutation.mutate(userId);
    }
  };

  // Function to handle updating a user
  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) {
      toast({
        title: "Erreur",
        description: "Aucun utilisateur sélectionné.",
        variant: "destructive",
      });
      return;
    }
    
    const form = e.target as HTMLFormElement;
    const username = (form.querySelector('#edit-username') as HTMLInputElement)?.value;
    const email = (form.querySelector('#edit-email') as HTMLInputElement)?.value;
    const role = (form.querySelector('#edit-role') as HTMLSelectElement)?.value;
    
    editUserMutation.mutate({
      userId: selectedUserForEdit.id,
      updates: {
        username: username || undefined,
        email: email || undefined,
        role: role || undefined,
      }
    });
    
    setShowEditUserDialog(false);
    setSelectedUserForEdit(null);
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
            <CardTitle>Accès refusé</CardTitle>
            <CardDescription>
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={`bg-card border-r transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
        <div className="flex items-center justify-between p-4 border-b">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">Admin</span>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <MenuIcon />
          </Button>
        </div>
        
        <nav className="p-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className={`w-full justify-start mb-1 ${sidebarOpen ? '' : 'justify-center'}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon className="h-4 w-4" />
                {sidebarOpen && <span className="ml-2">{item.label}</span>}
              </Button>
            );
          })}
        </nav>
      </div>
      
      {/* Main content - I'll add a placeholder for now since the rest of the component is missing */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Content management system</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

        <main className="flex-1 overflow-y-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Tableau de Bord</h2>
                
                {/* Stats cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analytics?.totalUsers || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {analytics ? `+${analytics.newUsersThisWeek || 0} cette semaine` : ''}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Contenus</CardTitle>
                      <Film className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {(analytics?.totalMovies || 0) + (analytics?.totalSeries || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Films et séries
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Abonnements</CardTitle>
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analytics?.activeSubscriptionsCount || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Actifs
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Revenus</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analytics && analytics.revenue ? `${analytics.revenue.monthly || 0} FCFA` : '0 FCFA'}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {analytics && analytics.revenue ? `${analytics.revenue.growth > 0 ? '+' : ''}${analytics.revenue.growth || 0}% ce mois` : ''}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Activité Récente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {securityLogs && securityLogs.slice(0, 5).map((log: SecurityEvent, index: number) => (
                        <div key={index} className="flex items-center">
                          <div className={`p-2 rounded-full ${
                            log.severity === 'high' ? 'bg-red-100 text-red-800' :
                            log.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {log.eventType === 'ADMIN_ACCESS' ? <Key className="h-4 w-4" /> :
                             log.eventType === 'FAILED_LOGIN' ? <UserX className="h-4 w-4" /> :
                             log.eventType === 'BRUTE_FORCE_ATTEMPT' ? <AlertTriangle className="h-4 w-4" /> :
                             <Shield className="h-4 w-4" />}
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium">
                              {log.eventType === 'ADMIN_ACCESS' ? 'Accès administrateur' :
                               log.eventType === 'FAILED_LOGIN' ? 'Échec de connexion' :
                               log.eventType === 'BRUTE_FORCE_ATTEMPT' ? 'Tentative de force brute' :
                               log.eventType || 'Événement inconnu'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {log.timestamp ? new Date(log.timestamp).toLocaleString('fr-FR') : 'Date non spécifiée'}
                            </p>
                          </div>
                        </div>
                      ))}
                      {(!securityLogs || securityLogs.length === 0) && (
                        <div className="text-center py-4 text-muted-foreground">
                          Aucune activité récente
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Content Management Tab */}
            <TabsContent value="content" className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Gestion des Contenus</h2>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleImportContent}
                      disabled={isImporting}
                    >
                      {isImporting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Import en cours...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Importer depuis TMDB
                        </>
                     )}
                    </Button>
                    <Button onClick={() => setShowAddContentDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un contenu
                    </Button>
                  </div>
                </div>

                {/* Search section */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Rechercher des contenus</CardTitle>
                    <CardDescription>
                      Rechercher des films ou séries spécifiques à importer
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Rechercher des films ou séries (ex: Marvel, Harry Potter, etc.)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearchContent()}
                      />
                      <Button 
                        onClick={handleSearchContent}
                        disabled={isSearching}
                      >
                        {isSearching ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Recherche...
                          </>
                        ) : (
                          <>
                            <Search className="h-4 w-4 mr-2" />
                            Rechercher
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Search results */}
                {showSearchResults && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Résultats de la recherche</CardTitle>
                      <CardDescription>
                        Résultats pour "{searchQuery}"
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="movies">
                        <TabsList>
                          <TabsTrigger value="movies">Films ({searchResults.movies.length})</TabsTrigger>
                          <TabsTrigger value="tv">Séries ({searchResults.tvShows.length})</TabsTrigger>
                        </TabsList>
                        <TabsContent value="movies" className="mt-4">
                          {searchResults.movies.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {searchResults.movies.map((movie) => (
                                <div key={movie.id} className="border rounded-lg p-4 flex flex-col">
                                  <div className="flex gap-4">
                                    {movie.poster_path ? (
                                      <img 
                                        src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} 
                                        alt={movie.title}
                                        className="w-16 h-24 object-cover rounded"
                                      />
                                    ) : (
                                      <div className="w-16 h-24 bg-muted rounded flex items-center justify-center">
                                        <Film className="h-8 w-8 text-muted-foreground" />
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      <h3 className="font-medium">{movie.title}</h3>
                                      <p className="text-sm text-muted-foreground">
                                        {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Date inconnue'}
                                      </p>
                                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                        {movie.overview || 'Aucune description disponible'}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="mt-3 flex gap-2">
                                    <Button 
                                      size="sm" 
                                      className="flex-1"
                                      onClick={() => handleImportSpecificContent(movie.id, 'movie', movie.title)}
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Importer
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              Aucun film trouvé
                            </div>
                          )}
                        </TabsContent>
                        <TabsContent value="tv" className="mt-4">
                          {searchResults.tvShows.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {searchResults.tvShows.map((show) => (
                                <div key={show.id} className="border rounded-lg p-4 flex flex-col">
                                  <div className="flex gap-4">
                                    {show.poster_path ? (
                                      <img 
                                        src={`https://image.tmdb.org/t/p/w92${show.poster_path}`} 
                                        alt={show.name}
                                        className="w-16 h-24 object-cover rounded"
                                      />
                                    ) : (
                                      <div className="w-16 h-24 bg-muted rounded flex items-center justify-center">
                                        <Film className="h-8 w-8 text-muted-foreground" />
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      <h3 className="font-medium">{show.name}</h3>
                                      <p className="text-sm text-muted-foreground">
                                        {show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'Date inconnue'}
                                      </p>
                                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                        {show.overview || 'Aucune description disponible'}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="mt-3 flex gap-2">
                                    <Button 
                                      size="sm" 
                                      className="flex-1"
                                      onClick={() => handleImportSpecificContent(show.id, 'tv', show.name)}
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Importer
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              Aucune série trouvée
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                )}

                {/* Content list */}
                <Card>
                  <CardHeader>
                    <CardTitle>Contenus existants</CardTitle>
                    <CardDescription>
                      Gérez les contenus disponibles sur la plateforme
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {contentLoading ? (
                      <div className="text-center py-8">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-muted-foreground">Chargement des contenus...</p>
                      </div>
                    ) : existingContent && existingContent.length > 0 ? (
                      <div className="space-y-4">
                        {existingContent.map((content: Content) => (
                          <div key={content.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                              {content.posterPath && (
                                <img 
                                  src={`https://image.tmdb.org/t/p/w92${content.posterPath}`} 
                                  alt={content.title || 'Contenu sans titre'}
                                  className="w-16 h-24 object-cover rounded"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              )}
                              <div>
                                <h3 className="font-medium">{content.title || 'Titre non disponible'}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {content.mediaType === 'movie' ? 'Film' : content.mediaType === 'tv' ? 'Série' : 'Type inconnu'} • 
                                  TMDB ID: {content.tmdbId || 'ID non disponible'}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  {content.odyseeUrl && (
                                    <Badge variant="secondary">
                                      Lien vidéo disponible
                                    </Badge>
                                  )}
                                  {!content.odyseeUrl && content.active && (
                                    <Badge variant="outline">
                                      Pas de lien vidéo
                                    </Badge>
                                  )}
                                  {!content.active && (
                                    <Badge variant="destructive">
                                      Inactif
                                    </Badge>
                                  )}
                                </div>
                                {content.odyseeUrl && (
                                  <p className="text-xs text-muted-foreground mt-1 truncate max-w-md">
                                    {content.odyseeUrl}
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="ml-2 h-4 w-4 p-0"
                                      onClick={() => {
                                        navigator.clipboard.writeText(content.odyseeUrl || '');
                                        toast({
                                          title: "Lien copié",
                                          description: "Le lien vidéo a été copié dans le presse-papiers.",
                                        });
                                      }}
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="ml-1 h-4 w-4 p-0"
                                      onClick={() => {
                                        window.open(content.odyseeUrl || '', '_blank');
                                      }}
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="ml-1 h-4 w-4 p-0"
                                      onClick={async () => {
                                        try {
                                          const response = await fetch(content.odyseeUrl || '', { method: 'HEAD' });
                                          if (response.ok) {
                                            toast({
                                              title: "Lien valide",
                                              description: "Le lien vidéo est accessible.",
                                            });
                                          } else {
                                            toast({
                                              title: "Lien inaccessible",
                                              description: `Le serveur a répondu avec le code ${response.status}.`,
                                              variant: "destructive",
                                            });
                                          }
                                        } catch (error) {
                                          toast({
                                            title: "Erreur de connexion",
                                            description: "Impossible de vérifier le lien vidéo. Il peut y avoir un problème de CORS.",
                                            variant: "destructive",
                                          });
                                        }
                                      }}
                                    >
                                      <Zap className="h-3 w-3" />
                                    </Button>
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {content.active && !content.odyseeUrl && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleAddVideoLink(content)}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Ajouter lien
                                </Button>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditContent(content)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => {
                                  if (window.confirm("Êtes-vous sûr de vouloir supprimer ce contenu ?")) {
                                    deleteContentMutation.mutate(content.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Aucun contenu trouvé
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-6">Gestion des Utilisateurs</h2>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Liste des utilisateurs</CardTitle>
                    <CardDescription>
                      Gérez les comptes utilisateurs de la plateforme
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {usersLoading ? (
                      <div className="text-center py-8">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-muted-foreground">Chargement des utilisateurs...</p>
                      </div>
                    ) : users && users.length > 0 ? (
                      <div className="space-y-4">
                        {users.map((user: User) => (
                          <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                                {user.username?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div>
                                <h3 className="font-medium">{user.username || 'Utilisateur'}</h3>
                                <p className="text-sm text-muted-foreground">{user.email || 'Email non disponible'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                {user.role === 'admin' ? 'Administrateur' : user.role === 'user' ? 'Utilisateur' : 'Rôle inconnu'}
                              </Badge>
                              <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleBanUser(user.id)}>
                                <Lock className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDeleteUser(user.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Aucun utilisateur trouvé
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Subscriptions Tab */}
            <TabsContent value="subscriptions" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-6">Gestion des Abonnements</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Basique</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold mb-2">2,000 FCFA</div>
                      <ul className="text-sm space-y-1">
                        <li>• Accès à la bibliothèque</li>
                        <li>• Qualité SD</li>
                        <li>• 1 écran simultané</li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Standard</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold mb-2">5,000 FCFA</div>
                      <ul className="text-sm space-y-1">
                        <li>• Accès à la bibliothèque</li>
                        <li>• Qualité HD</li>
                        <li>• 2 écrans simultanés</li>
                        <li>• Téléchargement</li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Premium</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold mb-2">10,000 FCFA</div>
                      <ul className="text-sm space-y-1">
                        <li>• Accès à la bibliothèque</li>
                        <li>• Qualité 4K</li>
                        <li>• 4 écrans simultanés</li>
                        <li>• Téléchargement</li>
                        <li>• Contenu exclusif</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Abonnements Actifs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {subscriptions && subscriptions.length > 0 ? (
                      <div className="space-y-4">
                        {subscriptions.map((subscription: Subscription) => (
                          <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h3 className="font-medium">
                                {users?.find((u: User) => u.id === subscription.userId)?.username || 'Utilisateur inconnu'}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Plan: {subscription.planId || 'Non spécifié'} • Expire le: {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString('fr-FR') : 'Date non spécifiée'}
                              </p>
                            </div>
                            <Badge variant="default">
                              {subscription.status || 'Inconnu'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Aucun abonnement actif
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-6">Statistiques</h2>
                
                {analyticsLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-muted-foreground">Chargement des statistiques...</p>
                  </div>
                ) : analyticsError ? (
                  <Card className="border-destructive">
                    <CardHeader>
                      <CardTitle className="text-destructive">Erreur de chargement</CardTitle>
                      <CardDescription>
                        Impossible de charger les statistiques: {analyticsError.message}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics"] })}>
                        Réessayer
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Revenus Mensuels</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">
                            {analytics && analytics.revenue ? `${analytics.revenue.monthly || 0} FCFA` : '0 FCFA'}
                          </div>
                          <p className="text-muted-foreground">
                            {analytics && analytics.revenue ? `${analytics.revenue.growth > 0 ? '+' : ''}${analytics.revenue.growth || 0}% par rapport au mois dernier` : ''}
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Abonnements</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Basique</span>
                              <span className="font-medium">{analytics?.subscriptions?.basic || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Standard</span>
                              <span className="font-medium">{analytics?.subscriptions?.standard || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Premium</span>
                              <span className="font-medium">{analytics?.subscriptions?.premium || 0}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>Activité des Utilisateurs</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span>Utilisateurs totaux</span>
                            <span className="font-medium">{analytics?.totalUsers || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Utilisateurs actifs</span>
                            <span className="font-medium">{analytics?.activeUsers || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Nouveaux cette semaine</span>
                            <span className="font-medium">{analytics?.newUsersThisWeek || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Vues quotidiennes</span>
                            <span className="font-medium">{analytics?.dailyViews || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Vues hebdomadaires</span>
                            <span className="font-medium">{analytics?.weeklyViews || 0}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-6">Sécurité</h2>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Journal de sécurité</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {securityLogs && securityLogs.length > 0 ? (
                      <div className="space-y-4">
                        {securityLogs.map((log: SecurityEvent, index: number) => (
                          <div key={index} className="flex items-start p-4 border rounded-lg">
                            <div className={`p-2 rounded-full mr-4 mt-1 ${
                              log.severity === 'high' ? 'bg-red-100 text-red-800' :
                              log.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {log.eventType === 'ADMIN_ACCESS' ? <Key className="h-4 w-4" /> :
                               log.eventType === 'FAILED_LOGIN' ? <UserX className="h-4 w-4" /> :
                               log.eventType === 'BRUTE_FORCE_ATTEMPT' ? <AlertTriangle className="h-4 w-4" /> :
                               log.eventType === 'XSS_ATTEMPT' ? <Shield className="h-4 w-4" /> :
                               <Shield className="h-4 w-4" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <h3 className="font-medium">
                                  {log.eventType === 'ADMIN_ACCESS' ? 'Accès administrateur' :
                                   log.eventType === 'FAILED_LOGIN' ? 'Échec de connexion' :
                                   log.eventType === 'BRUTE_FORCE_ATTEMPT' ? 'Tentative de force brute' :
                                   log.eventType === 'XSS_ATTEMPT' ? 'Tentative XSS' :
                                   log.eventType || 'Événement inconnu'}
                                </h3>
                                <Badge variant={
                                  log.severity === 'high' ? 'destructive' :
                                  log.severity === 'medium' ? 'secondary' :
                                  'default'
                                }>
                                  {log.severity === 'high' ? 'Critique' :
                                  log.severity === 'medium' ? 'Moyen' :
                                  'Faible'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {log.timestamp ? new Date(log.timestamp).toLocaleString('fr-FR') : 'Date non spécifiée'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {log.details || 'Aucun détail disponible'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        Aucun événement de sécurité enregistré
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-6">Paramètres de l'Application</h2>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Paramètres de Base</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Serveur de Base de Données</span>
                        <span className="font-medium">localhost:5432</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Version de l'API</span>
                        <span className="font-medium">v1</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Licence</span>
                        <span className="font-medium">Pro</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

          </Tabs>
        </main>
      </div>

      {/* Add Video Link Dialog */}
      <Dialog open={showAddVideoLinkDialog} onOpenChange={setShowAddVideoLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un lien vidéo</DialogTitle>
            <DialogDescription>
              Ajouter un lien vidéo pour le contenu: {selectedContentForVideo?.title || 'Contenu sélectionné'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitVideoLink}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="video-url">URL de la vidéo</Label>
                <Input
                  id="video-url"
                  value={videoLinkUrl}
                  onChange={(e) => setVideoLinkUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowAddVideoLinkDialog(false);
                  setVideoLinkUrl("");
                  setSelectedContentForVideo(null);
                }}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={addVideoLinkMutation.isPending || !videoLinkUrl.trim()}
              >
                {addVideoLinkMutation.isPending ? "Ajout en cours..." : "Ajouter le lien"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Content Dialog */}
      <Dialog open={showEditContentDialog} onOpenChange={setShowEditContentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le contenu</DialogTitle>
            <DialogDescription>
              Modifier les détails du contenu: {selectedContentForEdit?.title || 'Contenu sélectionné'}
            </DialogDescription>
          </DialogHeader>
          {selectedContentForEdit && (
            <form onSubmit={handleUpdateContent}>
              <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre</Label>
                    <Input
                      id="title"
                      defaultValue={selectedContentForEdit.title || ''}
                      placeholder="Titre du contenu"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="language">Langue</Label>
                    <Select defaultValue={selectedContentForEdit.language || 'vf'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vf">VF (Français)</SelectItem>
                        <SelectItem value="vostfr">VOSTFR (Version Originale Sous-Titrée)</SelectItem>
                        <SelectItem value="vo">VO (Version Originale)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quality">Qualité</Label>
                    <Select defaultValue={selectedContentForEdit.quality || 'hd'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sd">SD</SelectItem>
                        <SelectItem value="hd">HD</SelectItem>
                        <SelectItem value="4k">4K</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="media-type">Type de média</Label>
                    <Select defaultValue={selectedContentForEdit.mediaType || 'movie'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="movie">Film</SelectItem>
                        <SelectItem value="tv">Série</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    defaultValue={selectedContentForEdit.description || ''}
                    placeholder="Description du contenu"
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="genres">Genres</Label>
                  <Input
                    id="genres"
                    defaultValue={selectedContentForEdit.genres?.join(', ') || ''}
                    placeholder="Genres séparés par des virgules"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="release-date">Date de sortie</Label>
                  <Input
                    id="release-date"
                    type="date"
                    defaultValue={selectedContentForEdit.releaseDate || ''}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="poster-path">Chemin de l'affiche</Label>
                  <Input
                    id="poster-path"
                    defaultValue={selectedContentForEdit.posterPath || ''}
                    placeholder="/path/to/poster.jpg"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="backdrop-path">Chemin de l'arrière-plan</Label>
                  <Input
                    id="backdrop-path"
                    defaultValue={selectedContentForEdit.backdropPath || ''}
                    placeholder="/path/to/backdrop.jpg"
                  />
                </div>
                
                {/* Video Link Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="odysee-url">Lien vidéo (Odysee/YouTube/Vimeo)</Label>
                    {selectedContentForEdit.odyseeUrl && (
                      <Badge variant="secondary" className="text-xs">
                        Lien existant
                      </Badge>
                    )}
                  </div>
                  <Input
                    id="odysee-url"
                    name="odyseeUrl"
                    defaultValue={selectedContentForEdit.odyseeUrl || ''}
                    placeholder="https://odysee.com/... ou https://youtube.com/... ou https://vimeo.com/..."
                  />
                  {selectedContentForEdit.odyseeUrl && (
                    <p className="text-sm text-muted-foreground">
                      Lien actuel: {selectedContentForEdit.odyseeUrl}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="active">Contenu actif</Label>
                  <Switch
                    id="active"
                    defaultChecked={selectedContentForEdit.active !== false}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowEditContentDialog(false);
                    setSelectedContentForEdit(null);
                  }}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={createContentMutation.isPending}
                >
                  {createContentMutation.isPending ? "Ajout en cours..." : "Ajouter le contenu"}
                </Button>

              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Content Dialog */}
      <Dialog open={showAddContentDialog} onOpenChange={setShowAddContentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ajouter un contenu</DialogTitle>
            <DialogDescription>
              Ajouter un nouveau contenu à la plateforme
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            // Handle form submission
            const form = e.target as HTMLFormElement;
            const formData = new FormData(form);
            
            // Extract values from form
            const title = (form.querySelector('#add-title') as HTMLInputElement)?.value;
            const tmdbId = parseInt((form.querySelector('#add-tmdb-id') as HTMLInputElement)?.value) || 0;
            const language = (form.querySelector('#add-language') as HTMLSelectElement)?.value;
            const quality = (form.querySelector('#add-quality') as HTMLSelectElement)?.value;
            const mediaType = (form.querySelector('#add-media-type') as HTMLSelectElement)?.value;
            const description = (form.querySelector('#add-description') as HTMLTextAreaElement)?.value;
            const genres = (form.querySelector('#add-genres') as HTMLInputElement)?.value;
            const releaseDate = (form.querySelector('#add-release-date') as HTMLInputElement)?.value;
            const posterPath = (form.querySelector('#add-poster-path') as HTMLInputElement)?.value;
            const backdropPath = (form.querySelector('#add-backdrop-path') as HTMLInputElement)?.value;
            const odyseeUrl = (form.querySelector('#add-odysee-url') as HTMLInputElement)?.value;
            const active = (form.querySelector('#add-active') as HTMLInputElement)?.checked;
            
            // Validate required fields
            if (!title || !tmdbId) {
              toast({
                title: "Erreur",
                description: "Le titre et l'ID TMDB sont requis.",
                variant: "destructive",
              });
              return;
            }
            
            // Decode any HTML entities in the URL before sending to the server
            let cleanOdyseeUrl = odyseeUrl;
            if (odyseeUrl) {
              const textArea = document.createElement('textarea');
              textArea.innerHTML = odyseeUrl;
              cleanOdyseeUrl = textArea.value;
            }
            
            // Prepare content data
            const contentData = {
              tmdbId,
              title,
              language: language || 'vf',
              quality: quality || 'hd',
              mediaType: mediaType || 'movie',
              description: description || '',
              releaseDate: releaseDate || '',
              posterPath: posterPath || '',
              backdropPath: backdropPath || '',
              odyseeUrl: cleanOdyseeUrl || '',
              active: active !== undefined ? active : true,
              genres: genres ? genres.split(',').map(g => g.trim()).filter(g => g.length > 0) : [],
            };
            
            // Create content using mutation
            createContentMutation.mutate(contentData);
          }}>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-title">Titre *</Label>
                  <Input
                    id="add-title"
                    name="title"
                    placeholder="Titre du contenu"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="add-tmdb-id">ID TMDB *</Label>
                  <Input
                    id="add-tmdb-id"
                    name="tmdbId"
                    type="number"
                    placeholder="ID TMDB"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="add-language">Langue</Label>
                  <Select defaultValue="vf" name="language">
                    <SelectTrigger id="add-language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vf">VF (Français)</SelectItem>
                      <SelectItem value="vostfr">VOSTFR (Version Originale Sous-Titrée)</SelectItem>
                      <SelectItem value="vo">VO (Version Originale)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="add-quality">Qualité</Label>
                  <Select defaultValue="hd" name="quality">
                    <SelectTrigger id="add-quality">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sd">SD</SelectItem>
                      <SelectItem value="hd">HD</SelectItem>
                      <SelectItem value="4k">4K</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="add-media-type">Type de média</Label>
                  <Select defaultValue="movie" name="mediaType">
                    <SelectTrigger id="add-media-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="movie">Film</SelectItem>
                      <SelectItem value="tv">Série</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="add-description">Description</Label>
                <Textarea
                  id="add-description"
                  name="description"
                  placeholder="Description du contenu"
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="add-genres">Genres</Label>
                <Input
                  id="add-genres"
                  name="genres"
                  placeholder="Genres séparés par des virgules"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="add-release-date">Date de sortie</Label>
                <Input
                  id="add-release-date"
                  name="releaseDate"
                  type="date"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="add-poster-path">Chemin de l'affiche</Label>
                <Input
                  id="add-poster-path"
                  name="posterPath"
                  placeholder="/path/to/poster.jpg"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="add-backdrop-path">Chemin de l'arrière-plan</Label>
                <Input
                  id="add-backdrop-path"
                  name="backdropPath"
                  placeholder="/path/to/backdrop.jpg"
                />
              </div>
              
              {/* Video Link Field */}
              <div className="space-y-2">
                <Label htmlFor="add-odysee-url">Lien vidéo (Odysee/YouTube/Vimeo)</Label>
                <Input
                  id="add-odysee-url"
                  name="odyseeUrl"
                  placeholder="https://odysee.com/... ou https://youtube.com/... ou https://vimeo.com/..."
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="add-active">Contenu actif</Label>
                <Switch
                  id="add-active"
                  name="active"
                  defaultChecked={true}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowAddContentDialog(false);
                }}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={createContentMutation.isPending}
              >
                {createContentMutation.isPending ? "Ajout en cours..." : "Ajouter le contenu"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier un utilisateur</DialogTitle>
            <DialogDescription>
              Modifier les détails de l'utilisateur: {selectedUserForEdit?.username || 'Utilisateur sélectionné'}
            </DialogDescription>
          </DialogHeader>
          {selectedUserForEdit && (
            <form onSubmit={handleUpdateUser}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-username">Nom d'utilisateur</Label>
                  <Input
                    id="edit-username"
                    defaultValue={selectedUserForEdit.username || ''}
                    placeholder="Nom d'utilisateur"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    defaultValue={selectedUserForEdit.email || ''}
                    placeholder="Email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Rôle</Label>
                  <Select defaultValue={selectedUserForEdit.role || 'user'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrateur</SelectItem>
                      <SelectItem value="user">Utilisateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowEditUserDialog(false);
                    setSelectedUserForEdit(null);
                  }}
                >
                  Annuler
                </Button>
                <Button type="submit">
                  Enregistrer les modifications
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
  
  // Menu icon component
  function MenuIcon() {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    );
  }

  // User icon component
  function UserIcon() {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    );
  }

  // Mutation for editing users
  const editUserMutation = useMutation({
    mutationFn: async (data: { userId: string; updates: Partial<User> }) => {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error("Vous devez être connecté pour effectuer cette action");
      
      const csrfToken = await getCSRFToken(token);
      if (!csrfToken) throw new Error("Impossible d'obtenir le jeton de sécurité");
      
      const response = await fetch(`/api/admin/users/${data.userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(data.updates),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Utilisateur mis à jour",
        description: "L'utilisateur a été mis à jour avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour l'utilisateur.",
        variant: "destructive",
      });
    },
  });

  // Mutation for suspending users
  const suspendUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error("Vous devez être connecté pour effectuer cette action");
      
      const csrfToken = await getCSRFToken(token);
      if (!csrfToken) throw new Error("Impossible d'obtenir le jeton de sécurité");
      
      const response = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Utilisateur suspendu",
        description: "L'utilisateur a été suspendu avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de suspendre l'utilisateur.",
        variant: "destructive",
      });
    },
  });

  // Mutation for banning users
  const banUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error("Vous devez être connecté pour effectuer cette action");
      
      const csrfToken = await getCSRFToken(token);
      if (!csrfToken) throw new Error("Impossible d'obtenir le jeton de sécurité");
      
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Utilisateur banni",
        description: "L'utilisateur a été banni avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de bannir l'utilisateur.",
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting users
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error("Vous devez être connecté pour effectuer cette action");
      
      const csrfToken = await getCSRFToken(token);
      if (!csrfToken) throw new Error("Impossible d'obtenir le jeton de sécurité");
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'utilisateur.",
        variant: "destructive",
      });
    },
  });

}

export default AdminDashboard;
