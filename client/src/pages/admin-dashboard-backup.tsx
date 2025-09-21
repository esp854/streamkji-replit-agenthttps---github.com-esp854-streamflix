import { useState, useEffect, useRef } from "react";
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
  ExternalLink,
  Menu as MenuIcon,
  ArrowLeft
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
  
  // State for site settings
  const [siteSettings, setSiteSettings] = useState({
    siteName: "StreamFlix",
    siteDescription: "La meilleure plateforme de streaming pour vos films et séries préférés",
    adminEmail: "admin@streamflix.com",
    supportEmail: "support@streamflix.com",
    maintenanceMode: false,
    allowRegistrations: true,
    emailNotifications: true,
    twoFactorAuthRequired: false,
    limitLoginAttempts: true,
    theme: "dark",
    defaultLanguage: "fr"
  });
  
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

  // Mutation for updating users
  const updateUserMutation = useMutation({
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
      setShowEditUserDialog(false);
      setSelectedUserForEdit(null);
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

  // Mutation for unbanning users
  const unbanUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error("Vous devez être connecté pour effectuer cette action");
      
      const csrfToken = await getCSRFToken(token);
      if (!csrfToken) throw new Error("Impossible d'obtenir le jeton de sécurité");
      
      const response = await fetch(`/api/admin/users/${userId}/unban`, {
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
        title: "Utilisateur débanni",
        description: "L'utilisateur a été débanni avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de débannir l'utilisateur.",
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

  // Function to handle deleting a user
  const handleDeleteUser = (userId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) {
      deleteUserMutation.mutate(userId);
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
    
    updateUserMutation.mutate({
      userId: selectedUserForEdit.id,
      updates: {
        username: username || undefined,
        email: email || undefined,
        role: role || undefined,
      }
    });
  };

  // Function to handle banning a user
  const handleBanUser = (userId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir bannir cet utilisateur ?")) {
      banUserMutation.mutate(userId);
    }
  };

  // Function to handle unbanning a user
  const handleUnbanUser = (userId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir débannir cet utilisateur ?")) {
      unbanUserMutation.mutate(userId);
    }
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
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <div className={`bg-gray-800 border-r border-gray-700 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-400" />
              <span className="text-lg font-semibold text-white">Admin</span>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon"
            className="text-gray-300 hover:text-white hover:bg-gray-700"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <MenuIcon className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="p-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className={`w-full justify-start mb-1 text-gray-300 hover:text-white hover:bg-gray-700 ${activeTab === item.id ? 'bg-gray-700 text-white' : ''} ${sidebarOpen ? '' : 'justify-center'}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon className="h-4 w-4" />
                {sidebarOpen && <span className="ml-2">{item.label}</span>}
              </Button>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-gray-900">
        <div className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5 bg-gray-800">
              <TabsTrigger value="dashboard" className="text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white">Dashboard</TabsTrigger>
              <TabsTrigger value="content" className="text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white">Contenu</TabsTrigger>
              <TabsTrigger value="users" className="text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white">Utilisateurs</TabsTrigger>
              <TabsTrigger value="security" className="text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white">Sécurité</TabsTrigger>
              <TabsTrigger value="settings" className="text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white">Paramètres</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Utilisateurs</CardTitle>
                    <CardDescription className="text-gray-400">Statistiques des utilisateurs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-700">
                        <Users className="w-8 h-8 mb-2 text-blue-400" />
                        <span className="text-xl font-bold text-white">{analytics?.totalUsers || 0}</span>
                        <span className="text-sm text-gray-400">Utilisateurs totaux</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-700">
                        <Users className="w-8 h-8 mb-2 text-green-400" />
                        <span className="text-xl font-bold text-white">{analytics?.activeUsers || 0}</span>
                        <span className="text-sm text-gray-400">Utilisateurs actifs</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Contenu</CardTitle>
                    <CardDescription className="text-gray-400">Statistiques sur le contenu</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-700">
                        <Film className="w-8 h-8 mb-2 text-red-400" />
                        <span className="text-xl font-bold text-white">{analytics?.totalMovies || 0}</span>
                        <span className="text-sm text-gray-400">Films</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-700">
                        <Film className="w-8 h-8 mb-2 text-purple-400" />
                        <span className="text-xl font-bold text-white">{analytics?.totalSeries || 0}</span>
                        <span className="text-sm text-gray-400">Séries</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Revenus</CardTitle>
                    <CardDescription className="text-gray-400">Statistiques sur les revenus</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-700">
                        <CreditCard className="w-8 h-8 mb-2 text-yellow-400" />
                        <span className="text-xl font-bold text-white">${analytics?.revenue?.monthly || 0}</span>
                        <span className="text-sm text-gray-400">Revenus mensuels</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-700">
                        <TrendingUp className="w-8 h-8 mb-2 text-green-400" />
                        <span className="text-xl font-bold text-white">{analytics?.revenue?.growth || 0}%</span>
                        <span className="text-sm text-gray-400">Croissance</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="content">
              <div className="grid gap-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Gestion du contenu</CardTitle>
                    <CardDescription className="text-gray-400">Ajoutez, modifiez ou supprimez du contenu</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={() => setShowAddContentDialog(true)} className="bg-blue-600 hover:bg-blue-700">Ajouter du contenu</Button>
                      <Button onClick={handleImportContent} disabled={isImporting} className="bg-green-600 hover:bg-green-700">
                        {isImporting ? "Importation..." : "Importer du contenu"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Liste du contenu</CardTitle>
                    <CardDescription className="text-gray-400">Votre bibliothèque de contenu</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {existingContent?.map((content: Content) => (
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-700" key={content.id}>
                          <div>
                            <h3 className="text-lg font-bold text-white">{content.title}</h3>
                            <p className="text-sm text-gray-300">{content.description?.substring(0, 100)}...</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="secondary" size="sm" className="bg-gray-600 text-white hover:bg-gray-500" onClick={() => handleEditContent(content)}>Modifier</Button>
                            <Button variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => deleteContentMutation.mutate(content.id)}>Supprimer</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="users">
              <div className="grid gap-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Gestion des utilisateurs</CardTitle>
                    <CardDescription className="text-gray-400">Ajoutez, modifiez ou supprimez des utilisateurs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Recherchez par nom d'utilisateur"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        />
                        <Button onClick={handleSearchContent} disabled={isSearching} className="bg-blue-600 hover:bg-blue-700">
                          {isSearching ? "Recherche..." : "Rechercher"}
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        {users?.map((user: User) => (
                          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-700" key={user.id}>
                            <div>
                              <h3 className="text-lg font-bold text-white">{user.username}</h3>
                              <p className="text-sm text-gray-300">{user.email}</p>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="secondary" className="bg-gray-600 text-white">
                                  {user.role}
                                </Badge>
                                {user.banned && (
                                  <Badge variant="destructive" className="bg-red-600 text-white">
                                    Banni
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="secondary" size="sm" className="bg-gray-600 text-white hover:bg-gray-500" onClick={() => handleEditUser(user)}>Modifier</Button>
                              {user.banned ? (
                                <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleUnbanUser(user.id)}>Débannir</Button>
                              ) : (
                                <Button variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => handleBanUser(user.id)}>Bannir</Button>
                              )}
                              <Button variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => handleDeleteUser(user.id)}>Supprimer</Button>
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
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Gestion de la sécurité</CardTitle>
                    <CardDescription className="text-gray-400">Gérez les événements de sécurité</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {securityLogs?.map((log: SecurityEvent, index: number) => (
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-700" key={index}>
                          <div>
                            <h3 className="text-lg font-bold text-white">{log.eventType}</h3>
                            <p className="text-sm text-gray-300">{log.details}</p>
                          </div>
                          <Badge variant="secondary" className="bg-gray-600 text-white">{log.severity}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="settings">
              <div className="grid gap-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Paramètres du site</CardTitle>
                    <CardDescription className="text-gray-400">Gérez les paramètres du site</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="site-name" className="text-gray-300">Nom du site</Label>
                          <Input
                            id="site-name"
                            defaultValue="StreamFlix"
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="site-description" className="text-gray-300">Description du site</Label>
                          <Textarea
                            id="site-description"
                            defaultValue="La meilleure plateforme de streaming pour vos films et séries préférés"
                            className="bg-gray-700 border-gray-600 text-white"
                            rows={3}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="admin-email" className="text-gray-300">Email administrateur</Label>
                          <Input
                            id="admin-email"
                            type="email"
                            defaultValue="admin@streamflix.com"
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="support-email" className="text-gray-300">Email support</Label>
                          <Input
                            id="support-email"
                            type="email"
                            defaultValue="support@streamflix.com"
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="maintenance-mode" className="text-gray-300">Mode maintenance</Label>
                          <div className="flex items-center space-x-2">
                            <Switch id="maintenance-mode" />
                            <Label htmlFor="maintenance-mode" className="text-gray-300">Activer</Label>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="allow-registrations" className="text-gray-300">Inscriptions</Label>
                          <div className="flex items-center space-x-2">
                            <Switch id="allow-registrations" defaultChecked />
                            <Label htmlFor="allow-registrations" className="text-gray-300">Autoriser</Label>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email-notifications" className="text-gray-300">Notifications</Label>
                          <div className="flex items-center space-x-2">
                            <Switch id="email-notifications" defaultChecked />
                            <Label htmlFor="email-notifications" className="text-gray-300">Email</Label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-gray-300">Paramètres de sécurité</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <Switch id="2fa-required" />
                            <Label htmlFor="2fa-required" className="text-gray-300">Authentification à deux facteurs requise</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="login-attempts" defaultChecked />
                            <Label htmlFor="login-attempts" className="text-gray-300">Limiter les tentatives de connexion</Label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button className="bg-blue-600 hover:bg-blue-700">Enregistrer les paramètres</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Paramètres d'apparence</CardTitle>
                    <CardDescription className="text-gray-400">Personnalisez l'apparence du site</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-gray-300">Thème principal</Label>
                          <Select defaultValue="dark">
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                              <SelectValue placeholder="Sélectionnez un thème" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 border-gray-600 text-white">
                              <SelectItem value="light" className="text-white focus:bg-gray-600">Clair</SelectItem>
                              <SelectItem value="dark" className="text-white focus:bg-gray-600">Sombre</SelectItem>
                              <SelectItem value="auto" className="text-white focus:bg-gray-600">Automatique</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-gray-300">Langue par défaut</Label>
                          <Select defaultValue="fr">
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                              <SelectValue placeholder="Sélectionnez une langue" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 border-gray-600 text-white">
                              <SelectItem value="fr" className="text-white focus:bg-gray-600">Français</SelectItem>
                              <SelectItem value="en" className="text-white focus:bg-gray-600">Anglais</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button variant="secondary" className="bg-gray-700 text-white hover:bg-gray-600">Enregistrer l'apparence</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      {/* Add Content Dialog */}
      <Dialog open={showAddContentDialog} onOpenChange={setShowAddContentDialog}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Ajouter du contenu</DialogTitle>
            <DialogDescription className="text-gray-400">
              Ajoutez un nouveau film ou une série à la bibliothèque.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const formData = new FormData(form);
            
            createContentMutation.mutate({
              title: formData.get('title') as string,
              description: formData.get('description') as string,
              mediaType: formData.get('mediaType') as string,
              language: formData.get('language') as string,
              quality: formData.get('quality') as string,
              releaseDate: formData.get('releaseDate') as string,
              posterPath: formData.get('posterPath') as string,
              backdropPath: formData.get('backdropPath') as string,
              odyseeUrl: formData.get('odyseeUrl') as string,
              genres: (formData.get('genres') as string)?.split(',').map(g => g.trim()),
              active: formData.get('active') === 'on',
            });
          }}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-300">Titre</Label>
                  <Input
                    id="title"
                    defaultValue=""
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language" className="text-gray-300">Langue</Label>
                  <Select defaultValue="vf">
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Choisissez la langue" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600 text-white">
                      <SelectItem value="vf">Version Française</SelectItem>
                      <SelectItem value="vo">Version Originale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quality" className="text-gray-300">Qualité</Label>
                  <Select defaultValue="hd">
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Choisissez la qualité" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600 text-white">
                      <SelectItem value="sd">SD</SelectItem>
                      <SelectItem value="hd">HD</SelectItem>
                      <SelectItem value="uhd">UHD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="media-type" className="text-gray-300">Type de média</Label>
                  <Select defaultValue="movie">
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Choisissez le type de média" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600 text-white">
                      <SelectItem value="movie">Film</SelectItem>
                      <SelectItem value="tv">Série TV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-300">Description</Label>
                  <Textarea
                    id="description"
                    className="bg-gray-700 border-gray-600 text-white"
                    defaultValue=""
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="genres" className="text-gray-300">Genres (séparés par des virgules)</Label>
                  <Input
                    id="genres"
                    defaultValue=""
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="release-date" className="text-gray-300">Date de sortie</Label>
                  <Input
                    id="release-date"
                    defaultValue=""
                    className="bg-gray-700 border-gray-600 text-white"
                    type="date"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="poster-path" className="text-gray-300">Chemin de la poster</Label>
                  <Input
                    id="poster-path"
                    defaultValue=""
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="backdrop-path" className="text-gray-300">Chemin de la bannière</Label>
                  <Input
                    id="backdrop-path"
                    defaultValue=""
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="odysee-url" className="text-gray-300">Lien Odysee</Label>
                  <Input
                    id="odysee-url"
                    defaultValue=""
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="active" className="text-gray-300">Actif</Label>
                  <div className="flex items-center space-x-2">
                    <Switch id="active" />
                    <Label htmlFor="active" className="text-gray-300">Activer le contenu</Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Sauvegarder</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Content Dialog */}
      <Dialog open={showEditContentDialog} onOpenChange={setShowEditContentDialog}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Modifier le contenu</DialogTitle>
            <DialogDescription className="text-gray-400">
              Modifiez les détails du contenu sélectionné.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateContent}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-300">Titre</Label>
                  <Input
                    id="title"
                    defaultValue=""
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language" className="text-gray-300">Langue</Label>
                  <Select defaultValue="vf">
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Choisissez la langue" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600 text-white">
                      <SelectItem value="vf">Version Française</SelectItem>
                      <SelectItem value="vo">Version Originale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quality" className="text-gray-300">Qualité</Label>
                  <Select defaultValue="hd">
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Choisissez la qualité" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600 text-white">
                      <SelectItem value="sd">SD</SelectItem>
                      <SelectItem value="hd">HD</SelectItem>
                      <SelectItem value="uhd">UHD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="media-type" className="text-gray-300">Type de média</Label>
                  <Select defaultValue="movie">
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Choisissez le type de média" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600 text-white">
                      <SelectItem value="movie">Film</SelectItem>
                      <SelectItem value="tv">Série TV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Sauvegarder</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Content Dialog */}
      <Dialog open={showEditContentDialog} onOpenChange={setShowEditContentDialog}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Modifier le contenu</DialogTitle>
            <DialogDescription className="text-gray-400">
              Modifiez les détails du contenu sélectionné.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateContent}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-300">Titre</Label>
                  <Input
                    id="title"
                    defaultValue=""
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language" className="text-gray-300">Langue</Label>
                  <Select defaultValue="vf">
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Choisissez la langue" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600 text-white">
                      <SelectItem value="vf">Version Française</SelectItem>
                      <SelectItem value="vo">Version Originale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quality" className="text-gray-300">Qualité</Label>
                  <Select defaultValue="hd">
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Choisissez la qualité" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600 text-white">
                      <SelectItem value="sd">SD</SelectItem>
                      <SelectItem value="hd">HD</SelectItem>
                      <SelectItem value="uhd">UHD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="media-type" className="text-gray-300">Type de média</Label>
                  <Select defaultValue="movie">
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Choisissez le type de média" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600 text-white">
                      <SelectItem value="movie">Film</SelectItem>
                      <SelectItem value="tv">Série TV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-300">Description</Label>
                  <Textarea
                    id="description"
                    className="bg-gray-700 border-gray-600 text-white"
                    defaultValue=""
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="genres" className="text-gray-300">Genres (séparés par des virgules)</Label>
                  <Input
                    id="genres"
                    defaultValue=""
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="release-date" className="text-gray-300">Date de sortie</Label>
                  <Input
                    id="release-date"
                    defaultValue=""
                    className="bg-gray-700 border-gray-600 text-white"
                    type="date"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="poster-path" className="text-gray-300">Chemin de la poster</Label>
                  <Input
                    id="poster-path"
                    defaultValue=""
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="backdrop-path" className="text-gray-300">Chemin de la bannière</Label>
                  <Input
                    id="backdrop-path"
                    defaultValue=""
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="odysee-url" className="text-gray-300">Lien Odysee</Label>
                  <Input
                    id="odysee-url"
                    defaultValue=""
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="active" className="text-gray-300">Actif</Label>
                  <div className="flex items-center space-x-2">
                    <Switch id="active" />
                    <Label htmlFor="active" className="text-gray-300">Activer le contenu</Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Sauvegarder</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Add Video Link Dialog */}
      <Dialog open={showAddVideoLinkDialog} onOpenChange={setShowAddVideoLinkDialog}>
        <DialogContent className="max-w-sm max-h-[50vh] overflow-y-auto bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Ajouter un lien vidéo</DialogTitle>
            <DialogDescription className="text-gray-400">
              Ajoutez un lien vidéo pour le contenu sélectionné.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitVideoLink}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="video-url" className="text-gray-300">URL du lien vidéo</Label>
                <Input
                  id="video-url"
                  value={videoLinkUrl}
                  onInput={(e) => setVideoLinkUrl(e.currentTarget.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Ajouter</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
        <DialogContent className="max-w-md overflow-y-auto bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Modifier l'utilisateur</DialogTitle>
            <DialogDescription className="text-gray-400">
              Modifiez les détails de l'utilisateur sélectionné.
            </DialogDescription>
          </DialogHeader>
          {selectedUserForEdit && (
            <form onSubmit={handleUpdateUser}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-username" className="text-gray-300">Nom d'utilisateur</Label>
                  <Input
                    id="edit-username"
                    name="username"
                    defaultValue={selectedUserForEdit.username}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-email" className="text-gray-300">Email</Label>
                  <Input
                    id="edit-email"
                    name="email"
                    type="email"
                    defaultValue={selectedUserForEdit.email}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-role" className="text-gray-300">Rôle</Label>
                  <Select 
                    name="role" 
                    defaultValue={selectedUserForEdit.role}
                    onValueChange={(value) => {
                      const select = document.getElementById('edit-role') as HTMLSelectElement;
                      if (select) select.value = value;
                    }}>
                    <SelectTrigger className="col-span-3 bg-gray-700 border-gray-600 text-white" id="edit-role">
                      <SelectValue placeholder="Rôle" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600 text-white">
                      <SelectItem value="user" className="text-white focus:bg-gray-600">Utilisateur</SelectItem>
                      <SelectItem value="admin" className="text-white focus:bg-gray-600">Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Mettre à jour</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminDashboard;

                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-3">
                <Label htmlFor="quality" className="text-right text-gray-300">
                  Qualité
                </Label>
                <Select name="quality" defaultValue="hd">
                  <SelectTrigger className="col-span-3 bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Qualité" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600 text-white">
                    <SelectItem value="sd" className="text-white focus:bg-gray-600">SD</SelectItem>
                    <SelectItem value="hd" className="text-white focus:bg-gray-600">HD</SelectItem>
                    <SelectItem value="fullhd" className="text-white focus:bg-gray-600">Full HD</SelectItem>
                    <SelectItem value="4k" className="text-white focus:bg-gray-600">4K</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-3">
                <Label htmlFor="releaseDate" className="text-right text-gray-300">
                  Date de sortie
                </Label>
                <Input
                  id="releaseDate"
                  name="releaseDate"
                  type="date"
                  className="col-span-3 bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-3">
                <Label htmlFor="posterPath" className="text-right text-gray-300">
                  Affiche
                </Label>
                <Input
                  id="posterPath"
                  name="posterPath"
                  className="col-span-3 bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-3">
                <Label htmlFor="backdropPath" className="text-right text-gray-300">
                  Arrière-plan
                </Label>
                <Input
                  id="backdropPath"
                  name="backdropPath"
                  className="col-span-3 bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-3">
                <Label htmlFor="odyseeUrl" className="text-right text-gray-300">
                  URL Odysee
                </Label>
                <Input
                  id="odyseeUrl"
                  name="odyseeUrl"
                  className="col-span-3 bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-3">
                <Label htmlFor="genres" className="text-right text-gray-300">
                  Genres
                </Label>
                <Input
                  id="genres"
                  name="genres"
                  placeholder="Séparés par des virgules"
                  className="col-span-3 bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-3">
                <Label htmlFor="active" className="text-right text-gray-300">
                  Actif
                </Label>
                <Switch
                  id="active"
                  name="active"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Ajouter</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Content Dialog */}
      <Dialog open={showEditContentDialog} onOpenChange={setShowEditContentDialog}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Modifier le contenu</DialogTitle>
            <DialogDescription className="text-gray-400">
              Modifiez les détails du contenu sélectionné.
            </DialogDescription>
          </DialogHeader>
          {selectedContentForEdit && (
            <form onSubmit={handleUpdateContent}>
              <div className="grid gap-3 py-4">
                <div className="grid grid-cols-4 items-center gap-3">
                  <Label htmlFor="edit-title" className="text-right text-gray-300">
                    Titre
                  </Label>
                  <Input
                    id="edit-title"
                    name="title"
                    defaultValue={selectedContentForEdit.title}
                    className="col-span-3 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-3">
                  <Label htmlFor="edit-description" className="text-right text-gray-300">
                    Description
                  </Label>
                  <Textarea
                    id="edit-description"
                    name="description"
                    defaultValue={selectedContentForEdit.description ?? undefined}
                    className="col-span-3 bg-gray-700 border-gray-600 text-white"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-3">
                  <Label htmlFor="edit-mediaType" className="text-right text-gray-300">
                    Type
                  </Label>
                  <Select name="mediaType" value={selectedContentForEdit.mediaType} onValueChange={(value) => {
                    const select = document.getElementById('edit-mediaType') as HTMLSelectElement;
                    if (select) select.value = value;
                  }}>
                    <SelectTrigger className="col-span-3 bg-gray-700 border-gray-600 text-white" id="edit-mediaType">
                      <SelectValue placeholder="Type de média" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600 text-white">
                      <SelectItem value="movie" className="text-white focus:bg-gray-600">Film</SelectItem>
                      <SelectItem value="tv" className="text-white focus:bg-gray-600">Série TV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-3">
                  <Label htmlFor="edit-language" className="text-right text-gray-300">
                    Langue
                  </Label>
                  <Select name="language" value={selectedContentForEdit.language} onValueChange={(value) => {
                    const select = document.getElementById('edit-language') as HTMLSelectElement;
                    if (select) select.value = value;
                  }}>
                    <SelectTrigger className="col-span-3 bg-gray-700 border-gray-600 text-white" id="edit-language">
                      <SelectValue placeholder="Langue" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600 text-white">
                      <SelectItem value="vf" className="text-white focus:bg-gray-600">VF</SelectItem>
                      <SelectItem value="vostfr" className="text-white focus:bg-gray-600">VOSTFR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-3">
                  <Label htmlFor="edit-quality" className="text-right text-gray-300">
                    Qualité
                  </Label>
                  <Select name="quality" value={selectedContentForEdit.quality} onValueChange={(value) => {
                    const select = document.getElementById('edit-quality') as HTMLSelectElement;
                    if (select) select.value = value;
                  }}>
                    <SelectTrigger className="col-span-3 bg-gray-700 border-gray-600 text-white" id="edit-quality">
                      <SelectValue placeholder="Qualité" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600 text-white">
                      <SelectItem value="sd" className="text-white focus:bg-gray-600">SD</SelectItem>
                      <SelectItem value="hd" className="text-white focus:bg-gray-600">HD</SelectItem>
                      <SelectItem value="fullhd" className="text-white focus:bg-gray-600">Full HD</SelectItem>
                      <SelectItem value="4k" className="text-white focus:bg-gray-600">4K</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-3">
                  <Label htmlFor="edit-releaseDate" className="text-right text-gray-300">
                    Date de sortie
                  </Label>
                  <Input
                    id="edit-releaseDate"
                    name="releaseDate"
                    type="date"
                    defaultValue={selectedContentForEdit.releaseDate?.split('T')[0]}
                    className="col-span-3 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-3">
                  <Label htmlFor="edit-posterPath" className="text-right text-gray-300">
                    Affiche
                  </Label>
                  <Input
                    id="edit-posterPath"
                    name="posterPath"
                    defaultValue={selectedContentForEdit.posterPath ?? undefined}
                    className="col-span-3 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-3">
                  <Label htmlFor="edit-backdropPath" className="text-right text-gray-300">
                    Arrière-plan
                  </Label>
                  <Input
                    id="edit-backdropPath"
                    name="backdropPath"
                    defaultValue={selectedContentForEdit.backdropPath ?? undefined}
                    className="col-span-3 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-3">
                  <Label htmlFor="edit-odyseeUrl" className="text-right text-gray-300">
                    URL Odysee
                  </Label>
                  <Input
                    id="edit-odyseeUrl"
                    name="odyseeUrl"
                    defaultValue={selectedContentForEdit.odyseeUrl ?? undefined}
                    className="col-span-3 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-3">
                  <Label htmlFor="edit-genres" className="text-right text-gray-300">
                    Genres
                  </Label>
                  <Input
                    id="edit-genres"
                    name="genres"
                    defaultValue={selectedContentForEdit.genres?.join(', ')}
                    placeholder="Séparés par des virgules"
                    className="col-span-3 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-3">
                  <Label htmlFor="edit-active" className="text-right text-gray-300">
                    Actif
                  </Label>
                  <Switch
                    id="edit-active"
                    name="active"
                    defaultChecked={selectedContentForEdit.active}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Mettre à jour</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Add Video Link Dialog */}
      <Dialog open={showAddVideoLinkDialog} onOpenChange={setShowAddVideoLinkDialog}>
        <DialogContent className="max-w-md bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Ajouter un lien vidéo</DialogTitle>
            <DialogDescription className="text-gray-400">
              Ajoutez un lien Odysee pour ce contenu.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitVideoLink}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="videoUrl" className="text-right text-gray-300">
                  URL
                </Label>
                <Input
                  id="videoUrl"
                  value={videoLinkUrl}
                  onChange={(e) => setVideoLinkUrl(e.target.value)}
                  className="col-span-3 bg-gray-700 border-gray-600 text-white"
                  placeholder="https://odysee.com/..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Ajouter</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
        <DialogContent className="max-w-md bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Modifier l'utilisateur</DialogTitle>
            <DialogDescription className="text-gray-400">
              Modifiez les détails de l'utilisateur sélectionné.
            </DialogDescription>
          </DialogHeader>
          {selectedUserForEdit && (
            <form onSubmit={handleUpdateUser}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-username" className="text-right text-gray-300">
                    Nom d'utilisateur
                  </Label>
                  <Input
                    id="edit-username"
                    name="username"
                    defaultValue={selectedUserForEdit.username}
                    className="col-span-3 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-email" className="text-right text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="edit-email"
                    name="email"
                    type="email"
                    defaultValue={selectedUserForEdit.email}
                    className="col-span-3 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-role" className="text-right text-gray-300">
                    Rôle
                  </Label>
                  <Select name="role" value={selectedUserForEdit.role} onValueChange={(value) => {
                    const select = document.getElementById('edit-role') as HTMLSelectElement;
                    if (select) select.value = value;
                  }}>
                    <SelectTrigger className="col-span-3 bg-gray-700 border-gray-600 text-white" id="edit-role">
                      <SelectValue placeholder="Rôle" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600 text-white">
                      <SelectItem value="user" className="text-white focus:bg-gray-600">Utilisateur</SelectItem>
                      <SelectItem value="admin" className="text-white focus:bg-gray-600">Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Mettre à jour</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminDashboard;
