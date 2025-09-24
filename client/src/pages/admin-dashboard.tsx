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
  X,
  Loader2,
  Calendar,
  Hash,
  Link,
  Image,
  FileText,
  Tag,
  Clock,
  DollarSign,
  Activity,
  User,
  Video,
  Tv,
  BookOpen,
  Mail,
  Phone,
  MapPin,
  CalendarClock,
  Timer,
  Award,
  Crown,
  Gem,
  Sparkles,
  Wrench,
  RefreshCw,
  Filter,
  SortAsc,
  SortDesc
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import type { User as UserType, Content, Subscription, Payment } from "@shared/schema";
import { AddVideoLinkDialog } from "@/components/admin/add-video-link-dialog";
import { tmdbService } from "@/lib/tmdb";

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

// Add these interfaces for content and activity events
interface ContentEvent {
  id: string;
  timestamp: Date | string;
  eventType: string;
  description: string;
  severity: string;
}

interface ActivityEvent {
  id: string;
  timestamp: Date | string;
  eventType: string;
  userId?: string;
  ipAddress: string;
  userAgent?: string;
  details?: string;
  severity: string;
}

interface SecurityEvent {
  timestamp: Date | string; // Allow both Date and string types
  eventType: string;
  userId?: string;
  ipAddress: string;
  userAgent?: string;
  details?: string;
  severity: string;
  description: string;
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

  // Fetch activity logs data
  const { data: activityLogs, isLoading: activityLoading, error: activityLogsError } = useQuery({
    queryKey: ["/api/admin/activity-logs"],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch("/api/admin/activity-logs", {
        credentials: "include",
        headers: {
          ...(token ? { "Authorization": "Bearer " + token } : {}),
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch activity logs");
      
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

  // Fetch contact messages (admin only)
  const { data: contactMessages, isLoading: contactMessagesLoading, error: contactMessagesError } = useQuery({
    queryKey: ["/api/contact-messages"],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch("/api/contact-messages", {
        credentials: "include",
        headers: {
          ...(token ? { "Authorization": "Bearer " + token } : {}),
        },
      });
      if (!response.ok) throw new Error("Failed to fetch contact messages");
      return response.json();
    },
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  // Detect screen size to toggle sidebar behavior
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Open sidebar by default on desktop, close on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, sidebarOpen]);

  // Close sidebar with Escape key on mobile
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMobile, sidebarOpen]);

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
  const [tmdbSeasons, setTmdbSeasons] = useState<any[] | null>(null);
  const [loadingTmdbSeasons, setLoadingTmdbSeasons] = useState(false);
  
  // Content management state
  const [tmdbSearchQuery, setTmdbSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [odyseeUrl, setOdyseeUrl] = useState("");
  const [contentLanguage, setContentLanguage] = useState("vf");
  const [contentQuality, setContentQuality] = useState("hd");
  
  // Add state for user management dialog
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserType | null>(null);
  
  // State for search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{movies: any[], tvShows: any[]}>({movies: [], tvShows: []});
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Contact messages reply state
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const [selectedContactMessage, setSelectedContactMessage] = useState<any | null>(null);
  const [replyTitle, setReplyTitle] = useState("");
  const [replyBody, setReplyBody] = useState("");

  // Derived metrics for dashboard to tolerate API shape differences
  const totalUsersCount = (analytics as any)?.totalUsers ?? (users ? users.length : 0);
  const totalMoviesCount = (analytics as any)?.totalMovies ?? (existingContent ? existingContent.filter((c: Content) => c.mediaType === 'movie').length : 0);
  const totalSeriesCount = (analytics as any)?.totalSeries ?? (existingContent ? existingContent.filter((c: Content) => c.mediaType === 'tv').length : 0);
  const activeSubscriptionsCount = (analytics as any)?.activeSubscriptionsCount ?? (subscriptions ? subscriptions.filter((s: Subscription) => (s as any).status === 'active').length : 0);
  const monthlyRevenue = (analytics as any)?.revenue?.monthly ?? (subscriptions ? subscriptions.filter((s: Subscription) => (s as any).status === 'active').reduce((sum: number, s: Subscription) => sum + ((s as any).amount || 0), 0) : 0);
  const revenueGrowth = (analytics as any)?.revenue?.growth ?? 0;
  // Derived analytics for the Statistics tab
  const activeUsersCount = (analytics as any)?.activeUsers ?? (users ? users.length : 0);
  const dailyViewsCount = (analytics as any)?.dailyViews ?? (analytics as any)?.viewStats?.daily ?? 0;
  const weeklyViewsCount = (analytics as any)?.weeklyViews ?? (analytics as any)?.viewStats?.weekly ?? 0;
  const subsBasic = subscriptions ? subscriptions.filter((s: Subscription) => (s as any).planId === 'basic').length : ((analytics as any)?.subscriptions?.basic ?? 0);
  const subsStandard = subscriptions ? subscriptions.filter((s: Subscription) => (s as any).planId === 'standard').length : ((analytics as any)?.subscriptions?.standard ?? 0);
  const subsPremium = subscriptions ? subscriptions.filter((s: Subscription) => (s as any).planId === 'premium').length : ((analytics as any)?.subscriptions?.premium ?? 0);

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

  // Fetch TMDB seasons for a TV series
  const fetchTmdbSeasons = async (tmdbId: number | undefined) => {
    if (!tmdbId) return;
    setLoadingTmdbSeasons(true);
    try {
      const details = await tmdbService.getTVShowDetails(tmdbId);
      // Support both API shapes: direct seasons or nested under .show
      setTmdbSeasons(details?.seasons || details?.show?.seasons || []);
    } catch (error) {
      console.error("Error fetching TMDB seasons:", error);
      setTmdbSeasons(null);
    } finally {
      setLoadingTmdbSeasons(false);
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

  // Bulk generate episodes for a specific season based on TMDB season episode_count
  const bulkCreateEpisodesForSeason = async (seasonNumber: number, episodeCount: number) => {
    if (!selectedContentForEpisodes?.id) return;
    if (!episodeCount || episodeCount <= 0) return;

    if (!window.confirm(`Créer ${episodeCount} épisodes pour la saison ${seasonNumber} ?`)) {
      return;
    }

    try {
      for (let i = 1; i <= episodeCount; i++) {
        await createEpisodeMutation.mutateAsync({
          contentId: selectedContentForEpisodes.id,
          seasonNumber,
          episodeNumber: i,
          title: `Épisode ${i}`,
          active: true,
        } as any);
      }
      toast({
        title: "Épisodes créés",
        description: `Créé ${episodeCount} épisodes pour la saison ${seasonNumber}.`,
      });
      // Refresh list
      fetchEpisodes(selectedContentForEpisodes.id);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error?.message || "Échec de la création des épisodes",
        variant: "destructive",
      });
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
    fetchTmdbSeasons(content.tmdbId);
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
    onSuccess: (res: any) => {
      // Refresh episodes list for the selected series
      if (selectedContentForEpisodes?.id) {
        fetchEpisodes(selectedContentForEpisodes.id);
      }
      setShowEditEpisodeDialog(false);
      setSelectedEpisodeForEdit(null);
      toast({
        title: "Épisode ajouté",
        description: "L'épisode a été ajouté avec succès.",
      });
      try {
        const ep = res?.episode;
        const tmdbId = selectedContentForEpisodes?.tmdbId;
        if (ep?.odyseeUrl && tmdbId) {
          window.location.href = `/watch/tv/${tmdbId}/${ep.seasonNumber}/${ep.episodeNumber}`;
        }
      } catch {}
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter l'épisode.",
        variant: "destructive",
      });
    },
  });

  // Mutation for updating episodes
  const updateEpisodeMutation = useMutation({
    mutationFn: async (data: { episodeId: string; updates: Partial<Episode> }) => {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error("Vous devez être connecté pour effectuer cette action");
      
      const csrfToken = await getCSRFToken(token);
      if (!csrfToken) throw new Error("Impossible d'obtenir le jeton de sécurité");
      
      const response = await fetch(`/api/admin/episodes/${data.episodeId}`, {
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
    onSuccess: (res: any) => {
      // Refresh episodes list
      if (selectedContentForEpisodes?.id) {
        fetchEpisodes(selectedContentForEpisodes.id);
      }
      setShowEditEpisodeDialog(false);
      setSelectedEpisodeForEdit(null);
      toast({
        title: "Épisode mis à jour",
        description: "L'épisode a été mis à jour avec succès.",
      });
      try {
        const ep = res?.episode || selectedEpisodeForEdit;
        const tmdbId = selectedContentForEpisodes?.tmdbId;
        const hasUrl = ep && (ep as any).odyseeUrl && (ep as any).odyseeUrl.trim() !== '';
        if (hasUrl && tmdbId) {
          const seasonNum = (ep as any).seasonNumber;
          const episodeNum = (ep as any).episodeNumber;
          window.location.href = `/watch/tv/${tmdbId}/${seasonNum}/${episodeNum}`;
        }
      } catch {}
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour l'épisode.",
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
      toast({
        title: "Lien vidéo ajouté",
        description: "Le lien vidéo a été ajouté avec succès au contenu.",
      });
      const c = selectedContentForVideo;
      if (c) {
        if (c.mediaType === 'movie') {
          window.location.href = `/watch/movie/${c.tmdbId}`;
        } else if (c.mediaType === 'tv') {
          window.location.href = `/watch/tv/${c.tmdbId}/1/1`;
        }
      }
      setShowAddVideoLinkDialog(false);
      setVideoLinkUrl("");
      setSelectedContentForVideo(null);
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
    { id: "series", label: "Séries", icon: Tv },
    { id: "users", label: "Utilisateurs", icon: Users },
    { id: "subscriptions", label: "Abonnements", icon: CreditCard },
    { id: "analytics", label: "Statistiques", icon: TrendingUp },
    { id: "security", label: "Sécurité", icon: Shield },
    { id: "messages", label: "Messages", icon: Mail },
    { id: "settings", label: "Paramètres", icon: Settings },
  ];

  // Function to handle editing a user
  const handleEditUser = (user: UserType) => {
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

  // Mutation for suspending a user
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

  // Mutation for deleting a user
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

  // Mutation for banning a user
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

  // Mutation for editing a user
  const editUserMutation = useMutation({
    mutationFn: async (data: { userId: string; updates: Partial<UserType> }) => {
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

  // Send notification to a user (reply to contact message)
  const sendNotificationMutation = useMutation({
    mutationFn: async (data: { userId: string; title: string; message: string; type?: string }) => {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error("Vous devez être connecté pour effectuer cette action");
      const csrfToken = await getCSRFToken(token);
      if (!csrfToken) throw new Error("Impossible d'obtenir le jeton de sécurité");
      const response = await fetch(`/api/admin/notifications/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ ...data, type: data.type || 'info' }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Notification envoyée", description: "La réponse a été envoyée à l'utilisateur." });
      setShowReplyDialog(false);
      setSelectedContactMessage(null);
      setReplyTitle("");
      setReplyBody("");
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message || "Échec de l'envoi de la notification.", variant: "destructive" });
    }
  });

  // Delete contact message
  const deleteContactMessageMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error("Vous devez être connecté pour effectuer cette action");
      const csrfToken = await getCSRFToken(token);
      if (!csrfToken) throw new Error("Impossible d'obtenir le jeton de sécurité");
      const response = await fetch(`/api/contact-messages/${id}`, {
        method: "DELETE",
        headers: {
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
      queryClient.invalidateQueries({ queryKey: ["/api/contact-messages"] });
      toast({ title: "Message supprimé", description: "Le message de contact a été supprimé." });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message || "Impossible de supprimer le message.", variant: "destructive" });
    }
  });

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
    <div className="admin-theme flex min-h-screen bg-background text-foreground">
      {/* Mobile overlay for sidebar */}
      {sidebarOpen && isMobile && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}
      {/* Sidebar */}
      <div className={`bg-card border-r flex flex-col 
            fixed inset-y-0 left-0 z-50 w-64 transform md:static md:translate-x-0
            h-screen overflow-y-auto transition-transform duration-200 ease-out
            ${sidebarOpen ? 'translate-x-0 md:w-64' : '-translate-x-full md:translate-x-0 md:w-16'}`}>
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
            {sidebarOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
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
                onClick={() => { setActiveTab(item.id); if (isMobile) setSidebarOpen(false); }}
              >
                <Icon className="h-4 w-4" />
                {sidebarOpen && <span className="ml-2">{item.label}</span>}
              </Button>
            );
          })}
        </nav>
        <div className="mt-auto p-2 border-t sticky bottom-0 bg-card">
          <Button asChild variant="outline" className="w-full justify-start">
            <a href="/" className="flex items-center">
              <ExternalLink className="h-4 w-4" />
              {sidebarOpen && <span className="ml-2">Retour au site</span>}
            </a>
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <header className="border-b bg-card">
          <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Ouvrir le menu"
              >
                <MenuIcon className="h-5 w-5" />
              </Button>
              <h1 className="text-xl md:text-2xl font-bold">Tableau de Bord Administrateur</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  <User className="h-4 w-4" />
                </div>
                <span className="font-medium hidden sm:inline">{user.username}</span>
              </div>
              <Badge variant="secondary" className="hidden sm:inline-flex">Administrateur</Badge>
                          </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0">
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
                        {totalUsersCount}
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
                        {totalMoviesCount + totalSeriesCount}
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
                        {activeSubscriptionsCount}
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
                        {`${monthlyRevenue} FCFA`}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {`${revenueGrowth > 0 ? '+' : ''}${revenueGrowth}% ce mois`}
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
                               log.eventType}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(log.timestamp).toLocaleString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Content Management Tab */}
            <TabsContent value="content" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2 className="text-xl md:text-2xl font-bold">Gestion des Contenus</h2>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button className="w-full sm:w-auto" onClick={() => setShowAddContentDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter Contenu
                  </Button>
                  <Button className="w-full sm:w-auto" onClick={handleImportContent} disabled={isImporting}>
                    {isImporting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Import en cours...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Importer depuis TMDB
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Search bar */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un film ou une série..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchContent()}
                  />
                </div>
                <Button onClick={handleSearchContent} disabled={isSearching}>
                  {isSearching ? (
                    <div className="loader-wrapper">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Search results */}
              {showSearchResults && (
                <Card>
                  <CardHeader>
                    <CardTitle>Résultats de la recherche</CardTitle>
                    <CardDescription>
                      {searchResults.movies.length + searchResults.tvShows.length} résultats trouvés
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Movies */}
                      {searchResults.movies.map((movie: any) => (
                        <div key={`movie-${movie.id}`} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            {movie.poster_path ? (
                              <img 
                                src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} 
                                alt={movie.title}
                                className="w-12 h-16 object-cover rounded"
                              />
                            ) : (
                              <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
                                <Film className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <h3 className="font-medium">{movie.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'} • Film
                              </p>
                            </div>
                          </div>
                          <Button onClick={() => handleImportSpecificContent(movie.id, 'movie', movie.title)}>
                            Importer
                          </Button>
                        </div>
                      ))}

                      {/* TV Shows */}
                      {searchResults.tvShows.map((show: any) => (
                        <div key={`tv-${show.id}`} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            {show.poster_path ? (
                              <img 
                                src={`https://image.tmdb.org/t/p/w92${show.poster_path}`} 
                                alt={show.name}
                                className="w-12 h-16 object-cover rounded"
                              />
                            ) : (
                              <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
                                <Tv className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <h3 className="font-medium">{show.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'N/A'} • Série TV
                              </p>
                            </div>
                          </div>
                          <Button onClick={() => handleImportSpecificContent(show.id, 'tv', show.name)}>
                            Importer
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Content list */}
              <Card>
                <CardHeader>
                  <CardTitle>Liste des Contenus</CardTitle>
                  <CardDescription>
                    {existingContent ? `${existingContent.length} contenus` : 'Chargement...'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {contentLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : existingContent && existingContent.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {existingContent.map((content: Content) => (
                        <Card key={content.id} className="overflow-hidden">
                          <div className="relative">
                            {content.posterPath ? (
                              <img 
                                src={`https://image.tmdb.org/t/p/w500${content.posterPath}`} 
                                alt={content.title}
                                className="w-full h-40 md:h-48 object-cover"
                              />
                            ) : (
                              <div className="w-full h-40 md:h-48 bg-muted flex items-center justify-center">
                                {content.mediaType === 'movie' ? (
                                  <Film className="h-12 w-12 text-muted-foreground" />
                                ) : (
                                  <Tv className="h-12 w-12 text-muted-foreground" />
                                )}
                              </div>
                            )}
                            <Badge 
                              className="absolute top-2 right-2" 
                              variant={content.active ? "default" : "secondary"}
                            >
                              {content.active ? "Actif" : "Inactif"}
                            </Badge>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold line-clamp-1">{content.title}</h3>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">{content.mediaType === 'movie' ? 'Film' : 'Série'}</Badge>
                              <Badge variant="outline">{content.language}</Badge>
                              <Badge variant="outline">{content.quality}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {content.description || "Aucune description"}
                            </p>
                            <div className="flex justify-between items-center mt-4">
                              <div className="flex gap-1">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleAddVideoLink(content)}
                                >
                                  <Link className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleEditContent(content)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {content.mediaType === 'tv' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleViewEpisodes(content)}
                                    title="Gérer saisons & épisodes"
                                  >
                                    <Tv className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">Saisons & épisodes</span>
                                  </Button>
                                )}
                              </div>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => deleteContentMutation.mutate(content.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Film className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-1">Aucun contenu trouvé</h3>
                      <p className="text-muted-foreground">
                        Commencez par importer du contenu depuis TMDB
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Series Tab */}
            <TabsContent value="series" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Gestion des Séries</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>Liste des Séries TV</CardTitle>
                    <CardDescription>
                      {existingContent ? `${existingContent.filter((c: Content) => c.mediaType === 'tv').length} séries` : 'Chargement...'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {contentLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : existingContent && existingContent.filter((c: Content) => c.mediaType === 'tv').length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {existingContent.filter((c: Content) => c.mediaType === 'tv').map((series: Content) => (
                          <Card key={series.id} className="overflow-hidden">
                            <div className="relative">
                              {series.posterPath ? (
                                <img
                                  src={`https://image.tmdb.org/t/p/w500${series.posterPath}`}
                                  alt={series.title}
                                  className="w-full h-40 md:h-48 object-cover"
                                />
                              ) : (
                                <div className="w-full h-40 md:h-48 bg-muted flex items-center justify-center">
                                  <Tv className="h-12 w-12 text-muted-foreground" />
                                </div>
                              )}
                              <Badge className="absolute top-2 right-2" variant={series.active ? 'default' : 'secondary'}>
                                {series.active ? 'Actif' : 'Inactif'}
                              </Badge>
                            </div>
                            <CardContent className="p-4">
                              <h3 className="font-semibold line-clamp-1">{series.title}</h3>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline">Série</Badge>
                                <Badge variant="outline">{series.language}</Badge>
                                <Badge variant="outline">{series.quality}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                {series.description || 'Aucune description'}
                              </p>
                              <div className="flex justify-between items-center mt-4">
                                <Button size="sm" variant="outline" onClick={() => handleViewEpisodes(series)}>
                                  <Tv className="h-4 w-4 mr-2" />
                                  Gérer saisons & épisodes
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleEditContent(series)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Modifier la fiche
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Tv className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-1">Aucune série trouvée</h3>
                        <p className="text-muted-foreground">Importez des séries depuis TMDB ou ajoutez-en manuellement</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Messages de Contact</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>Boîte de réception</CardTitle>
                    <CardDescription>
                      {contactMessagesLoading ? 'Chargement...' : `${contactMessages?.length || 0} message(s)`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {contactMessagesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : contactMessages && contactMessages.length > 0 ? (
                      <div className="space-y-3">
                        {contactMessages.map((msg: any) => {
                          const matchedUser = (users || []).find((u: any) => (u.email || '').toLowerCase() === (msg.email || '').toLowerCase());
                          return (
                            <div key={msg.id} className="p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="min-w-0">
                                <div className="font-medium truncate">{msg.name} <span className="text-muted-foreground">&lt;{msg.email}&gt;</span></div>
                                <div className="text-sm text-muted-foreground line-clamp-2">{msg.message}</div>
                                <div className="text-xs text-muted-foreground mt-1">{new Date(msg.createdAt).toLocaleString('fr-FR')}</div>
                                {!matchedUser && (
                                  <div className="text-xs text-yellow-600 mt-1">Aucun utilisateur avec cet email. Réponse par notification indisponible.</div>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Button size="sm" variant="outline" onClick={() => {
                                  setSelectedContactMessage(msg);
                                  setReplyTitle(`Réponse à votre message`);
                                  setReplyBody('Bonjour,\n\n');
                                  setShowReplyDialog(true);
                                }} disabled={!matchedUser}>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Répondre
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => deleteContactMessageMutation.mutate(msg.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-1">Aucun message</h3>
                        <p className="text-muted-foreground">Les messages envoyés via la page Contact apparaîtront ici.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Reply Dialog */}
              <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Répondre au message</DialogTitle>
                    <DialogDescription>
                      Envoyer une notification à l'utilisateur correspondant à l'email du message.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="reply-title">Titre</Label>
                      <Input id="reply-title" value={replyTitle} onChange={(e) => setReplyTitle(e.target.value)} placeholder="Sujet de la notification" />
                    </div>
                    <div>
                      <Label htmlFor="reply-body">Message</Label>
                      <Textarea id="reply-body" value={replyBody} onChange={(e) => setReplyBody(e.target.value)} placeholder="Votre réponse..." className="min-h-[120px]" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowReplyDialog(false)}>Annuler</Button>
                    <Button onClick={() => {
                      if (!selectedContactMessage) return;
                      const matchedUser = (users || []).find((u: any) => (u.email || '').toLowerCase() === (selectedContactMessage.email || '').toLowerCase());
                      if (!matchedUser) {
                        toast({ title: 'Utilisateur introuvable', description: "Aucun utilisateur avec cet email.", variant: 'destructive' });
                        return;
                      }
                      if (!replyTitle.trim() || !replyBody.trim()) {
                        toast({ title: 'Champs requis', description: "Titre et message sont requis.", variant: 'destructive' });
                        return;
                      }
                      sendNotificationMutation.mutate({ userId: matchedUser.id, title: replyTitle.trim(), message: replyBody.trim(), type: 'info' });
                    }}>
                      Envoyer
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Gestion des Utilisateurs</h2>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Liste des Utilisateurs</CardTitle>
                    <CardDescription>
                      {users ? `${users.length} utilisateurs` : 'Chargement...'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {usersLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : users && users.length > 0 ? (
                      <div className="space-y-4">
                        {users.map((user: UserType) => (
                          <div key={user.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 md:p-4 border rounded-lg gap-3">
                            <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full">
                              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                                <User className="h-5 w-5" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-medium text-sm md:text-base truncate">{user.username}</h3>
                                <p className="text-xs md:text-sm text-muted-foreground break-all">{user.email}</p>
                              </div>
                              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditUser(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {user.role !== 'admin' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleSuspendUser(user.id)}
                                  >
                                    <UserX className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => handleDeleteUser(user.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-1">Aucun utilisateur trouvé</h3>
                        <p className="text-muted-foreground">
                          Il n'y a actuellement aucun utilisateur dans le système
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Subscriptions Tab */}
            <TabsContent value="subscriptions" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Gestion des Abonnements</h2>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Liste des Abonnements</CardTitle>
                    <CardDescription>
                      {subscriptions ? `${subscriptions.length} abonnements` : 'Chargement...'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {subscriptionsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : subscriptions && subscriptions.length > 0 ? (
                      <div className="space-y-4">
                        {subscriptions.map((subscription: Subscription) => (
                          <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-full ${
                                subscription.planId === 'basic' ? 'bg-blue-100 text-blue-800' :
                                subscription.planId === 'standard' ? 'bg-green-100 text-green-800' :
                                subscription.planId === 'premium' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {subscription.planId === 'basic' ? <Package className="h-5 w-5" /> :
                                 subscription.planId === 'standard' ? <Award className="h-5 w-5" /> :
                                 subscription.planId === 'premium' ? <Crown className="h-5 w-5" /> :
                                 <Gem className="h-5 w-5" />}
                              </div>
                              <div>
                                <h3 className="font-medium capitalize">
                                  {subscription.planId === 'basic' ? 'Basique' :
                                   subscription.planId === 'standard' ? 'Standard' :
                                   subscription.planId === 'premium' ? 'Premium' :
                                   subscription.planId}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(subscription.startDate).toLocaleDateString('fr-FR')} - 
                                  {new Date(subscription.endDate).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                              <Badge variant={
                                subscription.status === 'active' ? 'default' :
                                subscription.status === 'cancelled' ? 'destructive' :
                                'secondary'
                              }>
                                {subscription.status === 'active' ? 'Actif' :
                                 subscription.status === 'cancelled' ? 'Annulé' :
                                 'Expiré'}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{subscription.amount} FCFA</p>
                              <p className="text-sm text-muted-foreground capitalize">
                                {subscription.paymentMethod}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-1">Aucun abonnement trouvé</h3>
                        <p className="text-muted-foreground">
                          Il n'y a actuellement aucun abonnement dans le système
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Statistiques</h2>
                
                {/* Analytics cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {activeUsersCount}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        sur {totalUsersCount} au total
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Vues Quotidiennes</CardTitle>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {dailyViewsCount}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Vues aujourd'hui
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Vues Hebdomadaires</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {weeklyViewsCount}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Vues cette semaine
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Subscription distribution */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Répartition des Abonnements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-blue-100 text-blue-800">
                            <Package className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium">Basique</h3>
                            <p className="text-sm text-muted-foreground">Plan d'entrée de gamme</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{subsBasic}</p>
                          <p className="text-sm text-muted-foreground">abonnés</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-green-100 text-green-800">
                            <Award className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium">Standard</h3>
                            <p className="text-sm text-muted-foreground">Plan équilibré</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{subsStandard}</p>
                          <p className="text-sm text-muted-foreground">abonnés</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-purple-100 text-purple-800">
                            <Crown className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium">Premium</h3>
                            <p className="text-sm text-muted-foreground">Plan haut de gamme</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{subsPremium}</p>
                          <p className="text-sm text-muted-foreground">abonnés</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Sécurité</h2>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Journal de Sécurité</CardTitle>
                    <CardDescription>
                      {securityLogs ? `${securityLogs.length} événements` : 'Chargement...'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {securityLogsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : securityLogs && securityLogs.length > 0 ? (
                      <div className="space-y-4">
                        {securityLogs.map((log: SecurityEvent, index: number) => (
                          <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                            <div className={`p-2 rounded-full mt-1 ${
                              log.severity === 'high' ? 'bg-red-100 text-red-800' :
                              log.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              log.severity === 'low' ? 'bg-green-100 text-green-800' : ''
                            }`}>
                              <div className="h-4 w-4 rounded-full" />
                            </div>
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-gray-900">{log.eventType}</p>
                                <p className="text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
                              </div>
                              <p className="text-sm text-gray-500">{log.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-sm text-gray-500">No security logs found.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
              <div className="col-span-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {contentLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="loader-wrapper">
                          <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                      </div>
                    ) : existingContent && existingContent.length > 0 ? (
                      <div className="space-y-4">
                        {existingContent.map((log: ContentEvent, index: number) => (
                          <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                            <div className={`p-2 rounded-full mt-1 ${
                              log.severity === 'high' ? 'bg-red-100 text-red-800' :
                              log.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              log.severity === 'low' ? 'bg-green-100 text-green-800' : ''
                            }`}>
                              <div className="h-4 w-4 rounded-full" />
                            </div>
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-gray-900">{log.eventType}</p>
                                <p className="text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
                              </div>
                              <p className="text-sm text-gray-500">{log.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-sm text-gray-500">No content found.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
              <div className="col-span-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {activityLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : activityLogs && activityLogs.length > 0 ? (
                      <div className="space-y-4">
                        {activityLogs.map((log: ActivityEvent, index: number) => (
                          <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                            <div className={`p-2 rounded-full mt-1 ${
                              log.severity === 'high' ? 'bg-red-100 text-red-800' :
                              log.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {log.eventType === 'ADMIN_ACCESS' ? <Key className="h-4 w-4" /> :
                               log.eventType === 'FAILED_LOGIN' ? <UserX className="h-4 w-4" /> :
                               log.eventType === 'BRUTE_FORCE_ATTEMPT' ? <AlertTriangle className="h-4 w-4" /> :
                               <Shield className="h-4 w-4" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <p className="font-medium">
                                  {log.eventType === 'ADMIN_ACCESS' ? 'Accès administrateur' :
                                   log.eventType === 'FAILED_LOGIN' ? 'Échec de connexion' :
                                   log.eventType === 'BRUTE_FORCE_ATTEMPT' ? 'Tentative de force brute' :
                                   log.eventType}
                                </p>
                                <Badge variant={
                                  log.severity === 'high' ? 'destructive' :
                                  log.severity === 'medium' ? 'default' :
                                  'secondary'
                                }>
                                  {log.severity === 'high' ? 'Élevé' :
                                   log.severity === 'medium' ? 'Moyen' :
                                   'Faible'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {log.userId ? `Utilisateur: ${log.userId}` : 'Utilisateur inconnu'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                IP: {log.ipAddress}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(log.timestamp).toLocaleString('fr-FR')}
                              </p>
                              {log.details && (
                                <p className="text-sm mt-2 bg-muted p-2 rounded">
                                  {log.details}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-1">Aucun événement de sécurité</h3>
                        <p className="text-muted-foreground">
                          Aucun événement de sécurité n'a été enregistré pour le moment
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Paramètres</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Configuration du Système</CardTitle>
                      <CardDescription>
                        Paramètres généraux de l'application
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Mode Maintenance</h3>
                          <p className="text-sm text-muted-foreground">
                            Activer le mode maintenance pour les utilisateurs
                          </p>
                        </div>
                        <Switch />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Notifications par Email</h3>
                          <p className="text-sm text-muted-foreground">
                            Envoyer des notifications par email aux administrateurs
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Journalisation</h3>
                          <p className="text-sm text-muted-foreground">
                            Enregistrer tous les événements dans les journaux
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Performances</CardTitle>
                      <CardDescription>
                        Optimisation et surveillance des performances
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Cache</h3>
                          <p className="text-sm text-muted-foreground">
                            Utiliser le cache pour améliorer les performances
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Compression</h3>
                          <p className="text-sm text-muted-foreground">
                            Compresser les réponses pour réduire la bande passante
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <Button variant="outline" className="w-full">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Vider le Cache
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
      
      {/* Add Content Dialog */}
      <Dialog open={showAddContentDialog} onOpenChange={setShowAddContentDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ajouter un Contenu</DialogTitle>
            <DialogDescription>
              Ajouter un nouveau film ou série à la plateforme
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const formData = new FormData(form);
            
            createContentMutation.mutate({
              tmdbId: parseInt(formData.get('tmdbId') as string),
              title: formData.get('title') as string,
              description: formData.get('description') as string,
              posterPath: formData.get('posterPath') as string,
              backdropPath: formData.get('backdropPath') as string,
              releaseDate: formData.get('releaseDate') as string,
              genres: (formData.get('genres') as string).split(',').map(g => g.trim()).filter(g => g.length > 0),
              language: formData.get('language') as string,
              quality: formData.get('quality') as string,
              mediaType: formData.get('mediaType') as string,
              active: (formData.get('active') as string) === 'on',
            });
          }}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tmdbId" className="text-right">
                  ID TMDB
                </Label>
                <Input
                  id="tmdbId"
                  name="tmdbId"
                  type="number"
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Titre
                </Label>
                <Input
                  id="title"
                  name="title"
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="posterPath" className="text-right">
                  Affiche
                </Label>
                <Input
                  id="posterPath"
                  name="posterPath"
                  className="col-span-3"
                  placeholder="/path/to/poster.jpg"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="backdropPath" className="text-right">
                  Arrière-plan
                </Label>
                <Input
                  id="backdropPath"
                  name="backdropPath"
                  className="col-span-3"
                  placeholder="/path/to/backdrop.jpg"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="releaseDate" className="text-right">
                  Date
                </Label>
                <Input
                  id="releaseDate"
                  name="releaseDate"
                  type="date"
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="genres" className="text-right">
                  Genres
                </Label>
                <Input
                  id="genres"
                  name="genres"
                  className="col-span-3"
                  placeholder="Action, Aventure, Comédie"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="language" className="text-right">
                  Langue
                </Label>
                <Select name="language" defaultValue="vf">
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vf">VF</SelectItem>
                    <SelectItem value="vostfr">VOSTFR</SelectItem>
                    <SelectItem value="vo">VO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quality" className="text-right">
                  Qualité
                </Label>
                <Select name="quality" defaultValue="hd">
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sd">SD</SelectItem>
                    <SelectItem value="hd">HD</SelectItem>
                    <SelectItem value="4k">4K</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="mediaType" className="text-right">
                  Type
                </Label>
                <Select name="mediaType" defaultValue="movie">
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="movie">Film</SelectItem>
                    <SelectItem value="tv">Série TV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="active" className="text-right">
                  Actif
                </Label>
                <div className="col-span-3 flex items-center">
                  <Switch id="active" name="active" defaultChecked />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Ajouter</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Add Video Link Dialog */}
      <AddVideoLinkDialog 
        open={showAddVideoLinkDialog}
        onOpenChange={setShowAddVideoLinkDialog}
        content={selectedContentForVideo}
        getCSRFToken={getCSRFToken}
      />
      
      {/* Edit Content Dialog */}
      <Dialog open={showEditContentDialog} onOpenChange={setShowEditContentDialog}>
        <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto flex flex-col">
          <DialogHeader>
            <DialogTitle>Modifier le Contenu</DialogTitle>
            <DialogDescription>
              Modifier les détails du contenu sélectionné
            </DialogDescription>
          </DialogHeader>
          {selectedContentForEdit && (
            <form onSubmit={handleUpdateContent} className="flex-1 overflow-y-auto pr-2 pl-2">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Titre
                  </Label>
                  <Input
                    id="title"
                    defaultValue={selectedContentForEdit.title}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    defaultValue={selectedContentForEdit.description || ''}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="poster-path" className="text-right">
                    Affiche
                  </Label>
                  <Input
                    id="poster-path"
                    defaultValue={selectedContentForEdit.posterPath || ''}
                    className="col-span-3"
                    placeholder="/path/to/poster.jpg"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="backdrop-path" className="text-right">
                    Arrière-plan
                  </Label>
                  <Input
                    id="backdrop-path"
                    defaultValue={selectedContentForEdit.backdropPath || ''}
                    className="col-span-3"
                    placeholder="/path/to/backdrop.jpg"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="release-date" className="text-right">
                    Date
                  </Label>
                  <Input
                    id="release-date"
                    type="date"
                    defaultValue={selectedContentForEdit.releaseDate || ''}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="genres" className="text-right">
                    Genres
                  </Label>
                  <Input
                    id="genres"
                    defaultValue={selectedContentForEdit.genres?.join(', ') || ''}
                    className="col-span-3"
                    placeholder="Action, Aventure, Comédie"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="language" className="text-right">
                    Langue
                  </Label>
                  <Select defaultValue={selectedContentForEdit.language}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Sélectionner une langue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vf">VF</SelectItem>
                      <SelectItem value="vostfr">VOSTFR</SelectItem>
                      <SelectItem value="vo">VO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quality" className="text-right">
                    Qualité
                  </Label>
                  <Select defaultValue={selectedContentForEdit.quality}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Sélectionner une qualité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sd">SD</SelectItem>
                      <SelectItem value="hd">HD</SelectItem>
                      <SelectItem value="4k">4K</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="media-type" className="text-right">
                    Type
                  </Label>
                  <Select defaultValue={selectedContentForEdit.mediaType}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="movie">Film</SelectItem>
                      <SelectItem value="tv">Série TV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="odysee-url" className="text-right">
                    URL Odysee
                  </Label>
                  <Input
                    id="odysee-url"
                    defaultValue={selectedContentForEdit.odyseeUrl || ''}
                    className="col-span-3"
                    placeholder="https://odysee.com/..."
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="active" className="text-right">
                    Actif
                  </Label>
                  <div className="col-span-3 flex items-center">
                    <Switch 
                      id="active" 
                      defaultChecked={selectedContentForEdit.active} 
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Enregistrer</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier l'Utilisateur</DialogTitle>
            <DialogDescription>
              Modifier les détails de l'utilisateur sélectionné
            </DialogDescription>
          </DialogHeader>
          {selectedUserForEdit && (
            <form onSubmit={handleUpdateUser}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-username" className="text-right">
                    Nom d'utilisateur
                  </Label>
                  <Input
                    id="edit-username"
                    defaultValue={selectedUserForEdit.username}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="edit-email"
                    type="email"
                    defaultValue={selectedUserForEdit.email}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-role" className="text-right">
                    Rôle
                  </Label>
                  <Select defaultValue={selectedUserForEdit.role}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Utilisateur</SelectItem>
                      <SelectItem value="admin">Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Enregistrer</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Add Episode Dialog */}
      <Dialog open={showAddEpisodeDialog} onOpenChange={(open) => {
        setShowAddEpisodeDialog(open);
        if (!open) {
          setSelectedContentForEpisodes(null);
          setEpisodes([]);
          setTmdbSeasons(null);
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Gérer les Épisodes</DialogTitle>
            <DialogDescription>
              {selectedContentForEpisodes?.title}
            </DialogDescription>

            {/* TMDB Seasons Section */}
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2">Saisons (TMDB)</h4>
              {loadingTmdbSeasons ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : tmdbSeasons && tmdbSeasons.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {tmdbSeasons
                    .filter((s: any) => (s?.season_number ?? 0) > 0)
                    .map((season: any) => (
                      <div key={season.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <div className="font-medium">Saison {season.season_number} — {season.name}</div>
                          <div className="text-xs text-muted-foreground">{season.episode_count} épisodes</div>
                        </div>
                        <Button size="sm" onClick={() => bulkCreateEpisodesForSeason(season.season_number, season.episode_count)}>
                          Générer épisodes
                        </Button>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Aucune saison TMDB trouvée.</p>
              )}
            </div>
          </DialogHeader>
          
          {loadingEpisodes ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Liste des Épisodes</h3>
                <Button 
                  onClick={() => {
                    setSelectedEpisodeForEdit(null);
                    setShowEditEpisodeDialog(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter Épisode
                </Button>
              </div>
              
              {episodes.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {episodes.map((episode) => (
                    <div key={episode.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          S{episode.seasonNumber} E{episode.episodeNumber} - {episode.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {episode.releaseDate ? new Date(episode.releaseDate).toLocaleDateString('fr-FR') : 'Date non définie'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedEpisodeForEdit(episode);
                            setShowEditEpisodeDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => {
                            if (window.confirm("Êtes-vous sûr de vouloir supprimer cet épisode ?")) {
                              // Add delete episode mutation here
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
                <div className="text-center py-8">
                  <Tv className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-1">Aucun épisode trouvé</h3>
                  <p className="text-muted-foreground">
                    Commencez par ajouter un épisode
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit Episode Dialog */}
      <Dialog open={showEditEpisodeDialog} onOpenChange={setShowEditEpisodeDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedEpisodeForEdit ? "Modifier l'Épisode" : "Ajouter un Épisode"}
            </DialogTitle>
            <DialogDescription>
              {selectedEpisodeForEdit ? "Modifier les détails de l'épisode" : "Ajouter un nouvel épisode"}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const formData = new FormData(form);
            
            const episodeData = {
              contentId: selectedContentForEpisodes?.id || '',
              seasonNumber: parseInt(formData.get('seasonNumber') as string),
              episodeNumber: parseInt(formData.get('episodeNumber') as string),
              title: formData.get('title') as string,
              description: formData.get('description') as string,
              odyseeUrl: formData.get('odyseeUrl') as string,
              releaseDate: formData.get('releaseDate') as string,
              active: (formData.get('active') as string) === 'on',
            };
            
            if (selectedEpisodeForEdit) {
              // Update existing episode
              updateEpisodeMutation.mutate({
                episodeId: selectedEpisodeForEdit.id,
                updates: episodeData
              });
            } else {
              // Create new episode
              createEpisodeMutation.mutate(episodeData);
            }
          }}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="seasonNumber" className="text-right">
                  Saison
                </Label>
                <Input
                  id="seasonNumber"
                  name="seasonNumber"
                  type="number"
                  min="1"
                  defaultValue={selectedEpisodeForEdit?.seasonNumber || ''}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="episodeNumber" className="text-right">
                  Épisode
                </Label>
                <Input
                  id="episodeNumber"
                  name="episodeNumber"
                  type="number"
                  min="1"
                  defaultValue={selectedEpisodeForEdit?.episodeNumber || ''}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Titre
                </Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={selectedEpisodeForEdit?.title || ''}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={selectedEpisodeForEdit?.description || ''}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="odyseeUrl" className="text-right">
                  URL Odysee
                </Label>
                <Input
                  id="odyseeUrl"
                  name="odyseeUrl"
                  defaultValue={selectedEpisodeForEdit?.odyseeUrl || ''}
                  className="col-span-3"
                  placeholder="https://odysee.com/..."
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="releaseDate" className="text-right">
                  Date
                </Label>
                <Input
                  id="releaseDate"
                  name="releaseDate"
                  type="date"
                  defaultValue={selectedEpisodeForEdit?.releaseDate || ''}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="active" className="text-right">
                  Actif
                </Label>
                <div className="col-span-3 flex items-center">
                  <Switch 
                    id="active" 
                    name="active" 
                    defaultChecked={selectedEpisodeForEdit?.active !== false} 
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {selectedEpisodeForEdit ? "Enregistrer" : "Ajouter"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminDashboard;
