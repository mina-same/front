"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from 'react-i18next';
import Image from "next/image";
import Layout from "components/layout/Layout";
import Preloader from "components/elements/Preloader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Trash2,
  Copy,
  Users,
  UserPlus,
  UserMinus,
  Edit3,
  Save,
  X,
  Check,
  AlertTriangle,
  Gift,
  Horse,
  Crown,
  Medal,
  Calendar,
  MapPin,
  Video,
  Globe,
  Building,
  Map,
  Link as LinkIcon,
  Search,
  Plus,
  Minus
} from "lucide-react";

const EditCompetitionPage = () => {
  const { competitionsId: id, locale } = useParams();
  const router = useRouter();
  const { t } = useTranslation("editCompetition");

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [competition, setCompetition] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [competitors, setCompetitors] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [inviteLink, setInviteLink] = useState("");
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [editHorseModal, setEditHorseModal] = useState({ open: false, competitorId: null, surpriseHorseName: '', activeHorse: 'main' });
  
  // Editable form data
  const [formData, setFormData] = useState({
    nameEn: "",
    nameAr: "",
    about: "",
    liveLink: "",
    location: "",
    addressDetails: ""
  });

  const loadManagementData = useCallback(async (userId) => {
    try {
      const response = await fetch(`/api/competitions/${id}/manage?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setCompetitors(data.competitors || []);
        setInvitations(data.invitations || []);
      }

      // Load invite link
      const linkResponse = await fetch(`/api/competitions/${id}/invite-link?userId=${userId}`);
      if (linkResponse.ok) {
        const linkData = await linkResponse.json();
        setInviteLink(linkData.inviteLink || "");
      }
    } catch (error) {
      console.error("Error loading management data:", error);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        // Verify authentication
        const authResp = await fetch("/api/auth/verify", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!authResp.ok) {
          router.replace(`/${locale}/login`);
          return;
        }

        const authData = await authResp.json();
        if (!authData?.authenticated || !authData?.user?.id) {
          router.replace(`/${locale}/login`);
          return;
        }

        setCurrentUser(authData.user);

        // Load competition
        const compResp = await fetch(`/api/competitions/${id}`);
        if (!compResp.ok) {
          router.replace(`/${locale}/competitions`);
          return;
        }

        const compData = await compResp.json();
        const comp = compData?.competition;
        setCompetition(comp || null);
        
        // Populate form data
        if (comp) {
          setFormData({
            nameEn: comp.nameEn || "",
            nameAr: comp.nameAr || "",
            about: comp.about || "",
            liveLink: comp.liveLink || "",
            location: comp.location || "",
            addressDetails: comp.addressDetails || ""
          });
        }

        const creatorId = comp?.createdBy?._id;
        if (creatorId && creatorId === authData.user.id) {
          setAuthorized(true);
          // Load management data
          await loadManagementData(authData.user.id);
        } else {
          router.replace(`/${locale}/competitions/${id}`);
          return;
        }
      } catch (e) {
        console.error("Error loading competition:", e);
        router.replace(`/${locale}/competitions`);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, locale, router, loadManagementData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const response = await fetch(`/api/competitions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          updates: formData
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: t("success.updated"),
          description: "Competition details updated successfully!",
        });
        
        // Update local competition data
        setCompetition(prev => ({
          ...prev,
          ...formData
        }));
      } else {
        throw new Error(data.error || "Failed to update competition");
      }
    } catch (error) {
      toast({
        title: t("errors.general"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/competitions/${id}?userId=${currentUser.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: t("form.actions.deleteSuccess"),
          description: "Competition has been deleted successfully.",
        });
        router.replace(`/${locale}/competitions`);
      } else {
        throw new Error(data.error || "Failed to delete competition");
      }
    } catch (error) {
      toast({
        title: t("errors.general"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
      setShowDeleteConfirm(false);
    }
  };

  const copyInviteLink = async () => {
    if (inviteLink) {
      try {
        await navigator.clipboard.writeText(inviteLink);
        toast({
          title: t("invitations.inviteLink.copied"),
          description: "Invite link copied to clipboard!",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy link to clipboard",
          variant: "destructive",
        });
      }
    }
  };

  const generateNewInviteLink = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/competitions/${id}/invite-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id }),
      });

      const data = await response.json();

      if (response.ok) {
        setInviteLink(data.inviteLink);
        toast({
          title: "New invite link generated!",
          description: "A new invite link has been created and copied to clipboard.",
        });
        await navigator.clipboard.writeText(data.inviteLink);
      } else {
        throw new Error(data.error || "Failed to generate invite link");
      }
    } catch (error) {
      toast({
        title: t("errors.general"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const searchUsers = async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setSearching(false);
    }
  };

  const inviteUser = async (userId) => {
    try {
      setSaving(true);
      const response = await fetch(`/api/competitions/${id}/manage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          invitedUserId: userId,
          inviteLink: inviteLink || `${window.location.origin}/join/${id}`,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: t("success.invitationSent"),
          description: "User has been invited to the competition!",
        });
        await loadManagementData(currentUser.id);
        setSearchQuery("");
        setSearchResults([]);
      } else {
        throw new Error(data.error || "Failed to invite user");
      }
    } catch (error) {
      toast({
        title: t("errors.invitationFailed"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const removeUser = async (invitedUserId) => {
    try {
      setSaving(true);
      const response = await fetch(`/api/competitions/${id}/manage?userId=${currentUser.id}&invitedUserId=${invitedUserId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: t("success.userRemoved"),
          description: "User has been removed from the competition!",
        });
        await loadManagementData(currentUser.id);
      } else {
        throw new Error(data.error || "Failed to remove user");
      }
    } catch (error) {
      toast({
        title: t("errors.removeFailed"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const openEditHorse = (competitor) => {
    setEditHorseModal({
      open: true,
      competitorId: competitor._id,
      surpriseHorseName: competitor.surpriseHorseName || '',
      activeHorse: competitor.activeHorse || 'main'
    });
  };

  const submitEditHorse = async () => {
    try {
      const { competitorId, surpriseHorseName, activeHorse } = editHorseModal;
      const resp = await fetch('/api/competitors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitorId, surpriseHorseName, activeHorse })
      });
      
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Failed to update');
      
      toast({ 
        title: t("competitors.editHorse.saved"), 
        description: 'Horse selection saved successfully.' 
      });
      
      setEditHorseModal({ open: false, competitorId: null, surpriseHorseName: '', activeHorse: 'main' });
      await loadManagementData(currentUser.id);
    } catch (e) {
      toast({ 
        title: t("errors.general"), 
        description: e.message, 
        variant: 'destructive' 
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <Preloader />
      </Layout>
    );
  }

  if (!authorized || !competition) {
    return null;
  }

  const canDelete = !competitors.some(comp => 
    comp.gifts && comp.gifts.some(gift => gift.count > 0)
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              {t("hero.title")}
            </h1>
            <p className="text-gray-600 text-lg">
              {t("hero.subtitle")}
            </p>
          </div>

          {/* Competition Information */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                {t("form.competitionNames.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                  <Label htmlFor="nameAr">{t("form.competitionNames.arabic")}</Label>
                  <Input
                    id="nameAr"
                    value={formData.nameAr}
                    onChange={(e) => handleInputChange('nameAr', e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="nameEn">{t("form.competitionNames.english")}</Label>
                  <Input
                    id="nameEn"
                    value={formData.nameEn}
                    onChange={(e) => handleInputChange('nameEn', e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location & Date */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500" />
                {t("form.location.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                  <Label>{t("form.dateTime.date")}</Label>
                  <div className="mt-2 flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">
                      {competition?.date ? new Date(competition.date).toLocaleString() : "TBD"}
                    </span>
                  </div>
                </div>
                <div>
                  <Label>{t("form.location.address")}</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Enter competition location..."
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About Competition */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-500" />
                {t("form.about.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.about}
                onChange={(e) => handleInputChange('about', e.target.value)}
                placeholder="Describe your competition, rules, prizes, or any special details..."
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>

          {/* Address Details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="w-5 h-5 text-blue-500" />
                Address Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.addressDetails}
                onChange={(e) => handleInputChange('addressDetails', e.target.value)}
                placeholder="Enter detailed address information..."
                className="min-h-[80px]"
              />
            </CardContent>
          </Card>

          {/* Live Streaming */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-red-500" />
                {t("form.streaming.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={formData.liveLink}
                onChange={(e) => handleInputChange('liveLink', e.target.value)}
                placeholder="YouTube, Twitch, or other streaming platform link..."
                className="w-full"
              />
            </CardContent>
          </Card>

          {/* Invite Link Management */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-green-500" />
                {t("invitations.inviteLink.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    value={inviteLink}
                    readOnly
                    placeholder="No invite link generated yet"
                    className="flex-1"
                  />
                  <Button
                    onClick={copyInviteLink}
                    disabled={!inviteLink}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    {t("invitations.inviteLink.copy")}
                  </Button>
                  <Button
                    onClick={generateNewInviteLink}
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {t("invitations.inviteLink.generate")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Invitation */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-500" />
                {t("invitations.inviteUsers.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      searchUsers(e.target.value);
                    }}
                    placeholder={t("invitations.inviteUsers.placeholder")}
                    className="flex-1"
                  />
                  {searching && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    <Label>Search Results:</Label>
                    {searchResults.map((user) => (
                      <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                            {user.imageUrl ? (
                              <Image src={user.imageUrl} alt={user.name} width={40} height={40} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-500">
                                <Users className="w-5 h-5" />
                              </div>
                            )}
                          </div>
              <div>
                            <p className="font-medium">{user.fullName || user.name}</p>
                            <p className="text-sm text-gray-500">{user.userName || user.email}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => inviteUser(user._id)}
                          disabled={saving}
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <UserPlus className="w-4 h-4" />
                          {t("invitations.inviteUsers.invite")}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Competitors Management */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                {t("competitors.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {competitors.length > 0 ? (
                  competitors.map((competitor) => (
                    <div key={competitor._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                          {competitor.user?.imageUrl ? (
                            <Image src={competitor.user.imageUrl} alt={competitor.user.name} width={48} height={48} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                              <Users className="w-6 h-6" />
                            </div>
                          )}
                        </div>
              <div>
                          <p className="font-medium">{competitor.user?.fullName || competitor.user?.name}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">

                            <span>{competitor.horseName}</span>
                            {competitor.activeHorse === 'surprise' && (
                              <Badge variant="secondary" className="text-xs">
                                {t("competitors.editHorse.surpriseHorse")}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => openEditHorse(competitor)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Edit3 className="w-4 h-4" />
                          {t("competitors.editHorse.title")}
                        </Button>
                        <Button
                          onClick={() => removeUser(competitor.user._id)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 text-red-600 hover:text-red-700"
                        >
                          <UserMinus className="w-4 h-4" />
                          {t("invitations.manageUsers.remove")}
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No competitors yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                {t("form.actions.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? t("navigation.saving") : t("navigation.save")}
                  </Button>
                  <Button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={!canDelete || saving}
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t("form.actions.delete")}
                  </Button>
            </div>
                {!canDelete && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-800">
                      <Gift className="w-4 h-4" />
                      <span className="text-sm">{t("form.actions.cannotDelete")}</span>
            </div>
          </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-center">
            <Button
              onClick={() => router.push(`/${locale}/competitions/${id}`)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              {t("navigation.back")}
            </Button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteConfirm(false)}></div>
            <div className="relative bg-white rounded-lg p-6 max-w-md w-full">
              <div className="text-center space-y-4">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
                <h3 className="text-lg font-semibold">{t("form.actions.deleteConfirm")}</h3>
                <p className="text-gray-600">{t("form.actions.deleteWarning")}</p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => setShowDeleteConfirm(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDelete}
                    disabled={saving}
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    {saving ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Horse Modal */}
        {editHorseModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setEditHorseModal({ open: false, competitorId: null, surpriseHorseName: '', activeHorse: 'main' })}></div>
            <div className="relative bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">{t("competitors.editHorse.title")}</h3>
              <div className="space-y-4">
                <div>
                  <Label>{t("competitors.editHorse.surpriseName")}</Label>
                  <Input
                    value={editHorseModal.surpriseHorseName}
                    onChange={(e) => setEditHorseModal((s) => ({ ...s, surpriseHorseName: e.target.value }))}
                    placeholder="Optional backup horse"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>{t("competitors.editHorse.activeHorse")}</Label>
                  <select
                    value={editHorseModal.activeHorse}
                    onChange={(e) => setEditHorseModal((s) => ({ ...s, activeHorse: e.target.value }))}
                    className="w-full mt-2 p-3 border rounded-lg bg-white"
                  >
                    <option value="main">{t("competitors.editHorse.mainHorse")}</option>
                    <option value="surprise">{t("competitors.editHorse.surpriseHorse")}</option>
                  </select>
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditHorseModal({ open: false, competitorId: null, surpriseHorseName: '', activeHorse: 'main' })}
                  >
                    {t("competitors.editHorse.cancel")}
                  </Button>
                  <Button
                    onClick={submitEditHorse}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {t("competitors.editHorse.save")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EditCompetitionPage;


