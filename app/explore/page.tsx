"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Clock,
  Star,
  Filter,
  Search,
  Eye,
  Calendar,
  Users,
  DollarSign,
} from "lucide-react";

interface Destination {
  id: string;
  name: string;
  location: string;
  image: string;
  rating: number;
  duration: string;
  price: number;
  category: string;
  description: string;
  highlights: string[];
}

const mockDestinations: Destination[] = [
  {
    id: "1",
    name: "Gateway of India",
    location: "Colaba, Mumbai",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/d/d3/Gateway_of_India_-Mumbai.jpg",
    rating: 4.5,
    duration: "2-3 hours",
    price: 0,
    category: "Historical",
    description: "Iconic arch monument overlooking the Arabian Sea",
    highlights: [
      "Historical significance",
      "Great photo spot",
      "Boat rides available",
    ],
  },
  {
    id: "2",
    name: "Marine Drive",
    location: "South Mumbai",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/4/43/Marine_Drive_Mumbai_Bombay_by_Vibhabamba.jpg",
    rating: 4.7,
    duration: "1-2 hours",
    price: 0,
    category: "Scenic",
    description: "The Queen's Necklace - Mumbai's most famous promenade",
    highlights: ["Sunset views", "Street food", "Walking path"],
  },
  {
    id: "3",
    name: "Elephanta Caves",
    location: "Elephanta Island",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/e/e8/Elephanta_caves_view.jpg",
    rating: 4.3,
    duration: "Half day",
    price: 40,
    category: "Historical",
    description: "Ancient rock-cut caves with stunning sculptures",
    highlights: ["UNESCO World Heritage", "Ferry ride", "Ancient art"],
  },
  {
    id: "4",
    name: "Juhu Beach",
    location: "Juhu, Mumbai",
    image: "https://upload.wikimedia.org/wikipedia/commons/6/65/Juhu_beach.jpg",
    rating: 4.2,
    duration: "2-4 hours",
    price: 0,
    category: "Beach",
    description:
      "Popular beach known for street food and Bollywood celebrity homes",
    highlights: ["Street food", "Beach activities", "Celebrity spotting"],
  },
  {
    id: "5",
    name: "Chhatrapati Shivaji Terminus (CST)",
    location: "Fort, Mumbai",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/d/d7/The_Chhatrapati_Shivaji_Terminus_%28CST%29.jpg",
    rating: 4.4,
    duration: "1 hour",
    price: 0,
    category: "Architecture",
    description:
      "Victorian Gothic railway station and UNESCO World Heritage site",
    highlights: ["Victorian architecture", "UNESCO site", "Busy railway hub"],
  },
  {
    id: "6",
    name: "Dhobi Ghat",
    location: "Mahalaxmi, Mumbai",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/6/69/Dhobi_ghat_Mumbai.jpg",
    rating: 4.0,
    duration: "1 hour",
    price: 0,
    category: "Cultural",
    description: "World's largest outdoor laundry",
    highlights: ["Unique experience", "Photography", "Local culture"],
  },

  {
    id: "7",
    name: "Rangilo Re — NESCO Garba",
    location: "NESCO Grounds, Goregaon, Mumbai",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/a/a1/A_rasa_garba_dandiya_dance%2C_Navratri_tradition.jpg",
    rating: 4.6,
    duration: "Evening (3-4 hours)",
    price: 700,
    category: "Navratri",
    description:
      "Large-scale, ticketed Garba at NESCO (Goregaon) — often features celebrity singers and a big dance floor.",
    highlights: [
      "Celebrity performances",
      "Big dance floor",
      "Food stalls & stalls",
    ],
  },
  {
    id: "8",
    name: "Radiance Dandiya — Jio World / Falguni Pathak (BKC)",
    location: "Jio World Convention Centre, BKC, Mumbai",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/2/29/Navratri_Garba.jpg",
    rating: 4.8,
    duration: "Evening (3-4 hours)",
    price: 1500,
    category: "Navratri",
    description:
      "Premium, celebrity-headlined dandiya (recent years saw events with Falguni Pathak at major BKC venues).",
    highlights: ["Big-name artists", "Indoor AC venue", "Premium production"],
  },
  {
    id: "9",
    name: "Kora Kendra / Borivali Garba Grounds",
    location: "Borivali (community grounds), Mumbai",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/b/bf/Dandiya_Night.jpg",
    rating: 4.4,
    duration: "Evening (3-4 hours)",
    price: 300,
    category: "Navratri",
    description:
      "Traditional, high-energy suburban Garba (Borivali/Malad area) — strong community vibe and lots of local mandals.",
    highlights: ["Traditional Garba", "Community-led", "Affordable entry"],
  },
  {
    id: "10",
    name: "Naidu Club / Dadar Garba",
    location: "Dadar / Central Mumbai (local mandals & clubs)",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/b/bf/Dandiya_Night.jpg",
    rating: 4.3,
    duration: "Evening (3-4 hours)",
    price: 250,
    category: "Navratri",
    description:
      "Popular local club/mandal Garba in central Mumbai — great for experiencing authentic neighbourhood Navratri energy.",
    highlights: ["Local flavour", "Family friendly", "Classic Garba & Dandiya"],
  },
];


export default function page() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const categories = [
    "all",
    "Historical",
    "Scenic",
    "Beach",
    "Architecture",
    "Cultural",
  ];
  const priceRanges = ["all", "free", "paid"];

  const filteredDestinations = useMemo(() => {
    return mockDestinations.filter((destination) => {
      const matchesSearch =
        destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        destination.location
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        destination.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || destination.category === selectedCategory;

      const matchesPrice =
        priceFilter === "all" ||
        (priceFilter === "free" && destination.price === 0) ||
        (priceFilter === "paid" && destination.price > 0);

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [searchQuery, selectedCategory, priceFilter]);

  const handleViewItinerary = (destination: Destination) => {
    setSelectedDestination(destination);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedDestination(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-[#FFD700]/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">Explore Mumbai</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-[#FFD700]" />
              <span>Khar West, Mumbai</span>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-[#FFD700]/20 text-foreground placeholder-muted-foreground focus:border-[#FFD700]"
              />
            </div>

            <div className="flex gap-2">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-32 bg-background border-[#FFD700]/20 text-foreground">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  {categories.map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                      className="text-white hover:bg-gray-800"
                    >
                      {category === "all" ? "All Categories" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="w-24 bg-background border-[#FFD700]/20 text-foreground">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem
                    value="all"
                    className="text-foreground hover:bg-[#FFD700]/10"
                  >
                    All
                  </SelectItem>
                  <SelectItem
                    value="free"
                    className="text-foreground hover:bg-[#FFD700]/10"
                  >
                    Free
                  </SelectItem>
                  <SelectItem
                    value="paid"
                    className="text-foreground hover:bg-[#FFD700]/10"
                  >
                    Paid
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-6">
        <div className="mb-4">
          <p className="text-muted-foreground">
            Found {filteredDestinations.length} destination
            {filteredDestinations.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((destination: Destination) => (
            <Card
              key={destination.id}
              className="bg-background border-[#FFD700]/20 hover:border-[#FFD700]/40 transition-colors"
            >
              <div className="relative">
                <Image
                  src={destination.image || "/placeholder.svg"}
                  alt={destination.name}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <Badge className="absolute top-2 right-2 bg-[#FFD700] text-black">
                  {destination.category}
                </Badge>
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg">
                  {destination.name}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 text-[#FFD700]" />
                  <span>{destination.location}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  {destination.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-[#FFD700] fill-current" />
                      <span className="text-white">{destination.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {destination.duration}
                      </span>
                    </div>
                  </div>
                  <div className="text-[#FFD700] font-semibold">
                    {destination.price === 0 ? "Free" : `₹${destination.price}`}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {destination.highlights
                    .slice(0, 2)
                    .map((highlight: string, index: number) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs bg-[#FFD700]/10 text-[#FFD700]"
                      >
                        {highlight}
                      </Badge>
                    ))}
                </div>

                <Button
                  onClick={() => handleViewItinerary(destination)}
                  className="w-full bg-[#FFD700] text-black hover:bg-[#FFD700]/90 font-medium"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View 
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDestinations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">No destinations found</div>
            <p className="text-sm text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      {/* Dialog for Itinerary */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-background border-[#FFD700]/20 w-[95vw] md:w-[85vw] lg:w-[75vw] max-w-2xl mx-auto max-h-[90vh] overflow-y-auto text-foreground">
          <DialogHeader className="border-b border-[#FFD700]/20 pb-4">
            <DialogTitle className="text-foreground text-xl font-bold">
              {selectedDestination?.name} Itinerary
            </DialogTitle>
          </DialogHeader>

          {selectedDestination && (
            <div className="space-y-6 p-2">
              <div className="relative w-full aspect-video">
                <Image
                  src={selectedDestination.image || "/placeholder.svg"}
                  alt={selectedDestination.name}
                  width={600}
                  height={300}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FFD700]/5 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#FFD700]" />
                  <span className="text-white">
                    {selectedDestination.location}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#FFD700]" />
                  <span className="text-white">
                    {selectedDestination.duration}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-[#FFD700] fill-current" />
                  <span className="text-white">
                    {selectedDestination.rating} rating
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#FFD700]" />
                  <span className="text-white">
                    {selectedDestination.price === 0
                      ? "Free entry"
                      : `₹${selectedDestination.price}`}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-[#FFD700]/5 p-4 rounded-lg">
                  <h3 className="text-[#FFD700] font-semibold mb-2">Description</h3>
                  <p className="text-foreground/90">
                    {selectedDestination.description}
                  </p>
                </div>

                <div className="bg-[#FFD700]/5 p-4 rounded-lg">
                  <h3 className="text-[#FFD700] font-semibold mb-2">Highlights</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDestination.highlights.map((highlight: string, index: number) => (
                      <Badge
                        key={index}
                        className="bg-[#FFD700] text-black font-medium"
                      >
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-[#FFD700]/20">
                <Button className="flex-1 bg-[#FFD700] text-black hover:bg-[#FFD700]/90 font-medium transition-colors">
                  <Calendar className="w-4 h-4 mr-2" />
                  Add to Itinerary
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-[#FFD700]/20 text-foreground hover:bg-[#FFD700]/10 bg-transparent transition-colors"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
