import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertIssueSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, MapPin } from "lucide-react";
import { Link } from "wouter";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

const defaultCenter = { lat: 40.7128, lng: -74.0060 }; // New York City coordinates

export default function ReportIssuePage() {
  const [, setLocation] = useLocation();
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const { toast } = useToast();

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const form = useForm({
    resolver: zodResolver(insertIssueSchema),
    defaultValues: {
      title: "",
      description: "",
      location: defaultCenter,
      address: "",
      imageUrl: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/issues", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
      toast({
        title: "Success",
        description: "Issue reported successfully",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onMapClick = useCallback(async (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setMarkerPosition(newPos);
      form.setValue("location", newPos);
      // Set coordinates as fallback address immediately
      form.setValue("address", `${newPos.lat.toFixed(6)}, ${newPos.lng.toFixed(6)}`);
      setIsGeocoding(true);

      try {
        const geocoder = new google.maps.Geocoder();
        const results = await geocoder.geocode({ location: newPos });
        if (results.results[0]) {
          form.setValue("address", results.results[0].formatted_address);
        }
      } catch (error) {
        console.error("Reverse geocoding failed:", error);
        // Don't show error toast since we're using coordinates as fallback
      } finally {
        setIsGeocoding(false);
      }
    }
  }, [form]);

  const onSubmit = form.handleSubmit((data) => {
    // Allow submission even if geocoding failed
    if (isGeocoding) {
      toast({
        title: "Please wait",
        description: "Still getting location details...",
      });
      return;
    }

    // If address is empty due to geocoding failure, use coordinates
    if (!data.address) {
      data.address = `${data.location.lat.toFixed(6)}, ${data.location.lng.toFixed(6)}`;
    }

    mutation.mutate(data);
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Issues
            </Link>
          </div>

          <h1 className="text-2xl font-bold mb-6">Report New Issue</h1>

          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Brief description of the issue" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detailed Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Provide more details about the issue"
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Location on Map</FormLabel>
                <FormControl>
                  <div className="h-[300px] w-full rounded-md border">
                    {!isLoaded ? (
                      <div className="h-full flex items-center justify-center bg-muted">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      <GoogleMap
                        zoom={13}
                        center={markerPosition}
                        mapContainerClassName="w-full h-full rounded-md"
                        onClick={onMapClick}
                        options={{
                          streetViewControl: false,
                          mapTypeControl: false,
                        }}
                      >
                        <Marker
                          position={markerPosition}
                          icon={{
                            url: "data:image/svg+xml," + encodeURIComponent(`
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                              </svg>
                            `),
                          }}
                        />
                      </GoogleMap>
                    )}
                  </div>
                </FormControl>
                <div className="mt-2 text-sm text-muted-foreground flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Click on the map to set the location
                </div>
                <FormMessage>{form.formState.errors.location?.message}</FormMessage>
              </FormItem>

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <Input 
                          type="file" 
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const formData = new FormData();
                              formData.append("file", file);
                              try {
                                const res = await fetch("/api/upload", {
                                  method: "POST",
                                  body: formData,
                                });
                                const data = await res.json();
                                field.onChange(data.url);
                                toast({
                                  title: "Success",
                                  description: "Image uploaded successfully"
                                });
                              } catch (error) {
                                console.error("Failed to upload image:", error);
                                toast({
                                  title: "Error",
                                  description: "Failed to upload image",
                                  variant: "destructive",
                                });
                              }
                            }
                          }}
                        />
                        {field.value && (
                          <div className="mt-2">
                            <img
                              src={field.value}
                              alt="Preview"
                              className="max-w-xs rounded-md"
                            />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={mutation.isPending || isGeocoding}
              >
                {(mutation.isPending || isGeocoding) ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Submit Issue
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}