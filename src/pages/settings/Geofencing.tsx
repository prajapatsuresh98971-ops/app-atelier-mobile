import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { BottomTabBar } from "@/components/BottomTabBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapView } from "@/components/MapView";
import { useGeofences, Geofence } from "@/hooks/useGeofences";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Plus, Trash2, Edit } from "lucide-react";

export default function Geofencing() {
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [pairedChildren, setPairedChildren] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGeofence, setEditingGeofence] = useState<Geofence | null>(null);
  const [mapCenter, setMapCenter] = useState({ latitude: 40.7128, longitude: -74.0060 });
  
  const [formData, setFormData] = useState({
    name: "",
    latitude: 40.7128,
    longitude: -74.0060,
    radius: 200,
    notify_on_enter: true,
    notify_on_exit: true,
  });

  const { geofences, isLoading, createGeofence, updateGeofence, deleteGeofence } = useGeofences(selectedChild);

  useEffect(() => {
    const fetchPairedChildren = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await (supabase as any)
        .from('device_pairings')
        .select('child_id, profiles!device_pairings_child_id_fkey(name)')
        .eq('parent_id', user.id)
        .eq('is_active', true);

      if (data) {
        setPairedChildren(data);
        if (data.length > 0 && !selectedChild) {
          setSelectedChild(data[0].child_id);
        }
      }
    };

    fetchPairedChildren();
  }, []);

  const handleSubmit = async () => {
    try {
      if (editingGeofence) {
        await updateGeofence(editingGeofence.id, formData);
      } else {
        await createGeofence({
          ...formData,
          child_id: selectedChild,
        });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving geofence:', error);
    }
  };

  const handleEdit = (geofence: Geofence) => {
    setEditingGeofence(geofence);
    setFormData({
      name: geofence.name,
      latitude: geofence.latitude,
      longitude: geofence.longitude,
      radius: geofence.radius,
      notify_on_enter: geofence.notify_on_enter,
      notify_on_exit: geofence.notify_on_exit,
    });
    setMapCenter({ latitude: geofence.latitude, longitude: geofence.longitude });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this safe zone?')) {
      await deleteGeofence(id);
    }
  };

  const resetForm = () => {
    setEditingGeofence(null);
    setFormData({
      name: "",
      latitude: 40.7128,
      longitude: -74.0060,
      radius: 200,
      notify_on_enter: true,
      notify_on_exit: true,
    });
    setMapCenter({ latitude: 40.7128, longitude: -74.0060 });
  };

  const handleMapClick = (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
    setMapCenter({ latitude: lat, longitude: lng });
  };

  return (
    <Layout title="Geofencing Settings">
      <div className="min-h-screen bg-background pb-20">
        <div className="container mx-auto p-4 space-y-6">
          {/* Child Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Child</CardTitle>
              <CardDescription>Choose which child to manage geofences for</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedChild} onValueChange={setSelectedChild}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a child" />
                </SelectTrigger>
                <SelectContent>
                  {pairedChildren.map((child) => (
                    <SelectItem key={child.child_id} value={child.child_id}>
                      {child.profiles?.name || 'Unknown'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Map View */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Safe Zones Map
                </CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetForm}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Safe Zone
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingGeofence ? 'Edit Safe Zone' : 'Create Safe Zone'}
                      </DialogTitle>
                      <DialogDescription>
                        Click on the map to set the location
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Zone Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g., Home, School"
                        />
                      </div>

                      <div className="h-[300px] rounded-lg overflow-hidden border">
                        <MapView
                          latitude={formData.latitude}
                          longitude={formData.longitude}
                          zoom={14}
                          showMarker={true}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="latitude">Latitude</Label>
                          <Input
                            id="latitude"
                            type="number"
                            step="0.000001"
                            value={formData.latitude}
                            onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="longitude">Longitude</Label>
                          <Input
                            id="longitude"
                            type="number"
                            step="0.000001"
                            value={formData.longitude}
                            onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="radius">Radius (meters)</Label>
                        <Input
                          id="radius"
                          type="number"
                          value={formData.radius}
                          onChange={(e) => setFormData({ ...formData, radius: parseInt(e.target.value) })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="notify-enter">Notify on Enter</Label>
                        <Switch
                          id="notify-enter"
                          checked={formData.notify_on_enter}
                          onCheckedChange={(checked) => setFormData({ ...formData, notify_on_enter: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="notify-exit">Notify on Exit</Label>
                        <Switch
                          id="notify-exit"
                          checked={formData.notify_on_exit}
                          onCheckedChange={(checked) => setFormData({ ...formData, notify_on_exit: checked })}
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSubmit} disabled={isLoading || !formData.name}>
                        {editingGeofence ? 'Update' : 'Create'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] rounded-lg overflow-hidden">
                <MapView
                  latitude={mapCenter.latitude}
                  longitude={mapCenter.longitude}
                  zoom={12}
                  showMarker={false}
                />
              </div>
            </CardContent>
          </Card>

          {/* Geofences List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Safe Zones</CardTitle>
              <CardDescription>
                {geofences.length} safe zone{geofences.length !== 1 ? 's' : ''} configured
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {geofences.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No safe zones configured yet. Click "Add Safe Zone" to create one.
                </p>
              ) : (
                geofences.map((geofence) => (
                  <div
                    key={geofence.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">{geofence.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Radius: {geofence.radius}m
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {geofence.notify_on_enter && 'Enter '}
                          {geofence.notify_on_enter && geofence.notify_on_exit && '& '}
                          {geofence.notify_on_exit && 'Exit '}
                          alerts enabled
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(geofence)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(geofence.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <BottomTabBar />
    </Layout>
  );
}
