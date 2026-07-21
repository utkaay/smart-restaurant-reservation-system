const DEFAULT_RESTAURANTS = [
    {
        id: 1,
        name: "Olive & Ember",
        cuisine: "Mediterranean",
        rating: 4.8,
        hours: "12:00 PM - 10:30 PM",
        openingTime: "12:00",
        closingTime: "22:30",
        priceLevel: "$$$",
        distanceCategory: "Nearby",
        location: "Harbor District",
        image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=80",
        badges: ["Patio", "Seafood", "Date night"],
        sustainabilityBadges: ["Eco Certified", "Locally Sourced"],
        allergenBadges: ["Shellfish", "Dairy"],
        menu: [
            { id: "olive-flatbread", name: "Herb Flatbread", price: 9, category: "Starter", tags: ["Vegetarian"] },
            { id: "olive-salmon", name: "Harbor Salmon", price: 24, category: "Main", tags: ["Seafood"] },
            { id: "olive-citrus-tart", name: "Citrus Tart", price: 8, category: "Dessert", tags: ["Sweet"] }
        ]
    },
    {
        id: 2,
        name: "Noodle House",
        cuisine: "Japanese",
        rating: 4.7,
        hours: "11:30 AM - 11:00 PM",
        openingTime: "11:30",
        closingTime: "23:00",
        priceLevel: "$$",
        distanceCategory: "Nearby",
        location: "Midtown",
        image: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=900&q=80",
        badges: ["Ramen", "Quick seating", "Vegetarian"],
        sustainabilityBadges: ["Plastic Free"],
        allergenBadges: ["Soy", "Gluten"],
        menu: [
            { id: "noodle-edamame", name: "Sea Salt Edamame", price: 6, category: "Starter", tags: ["Vegetarian"] },
            { id: "noodle-tonkotsu", name: "Tonkotsu Ramen", price: 16, category: "Main", tags: ["Ramen"] },
            { id: "noodle-mochi", name: "Mochi Trio", price: 7, category: "Dessert", tags: ["Sweet"] }
        ]
    },
    {
        id: 3,
        name: "The Garden Table",
        cuisine: "Modern American",
        rating: 4.6,
        hours: "9:00 AM - 9:00 PM",
        openingTime: "09:00",
        closingTime: "21:00",
        priceLevel: "$$",
        distanceCategory: "Medium",
        location: "Park Avenue",
        image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=900&q=80",
        badges: ["Brunch", "Family friendly", "Organic"],
        sustainabilityBadges: ["Organic", "Locally Sourced"],
        allergenBadges: ["Dairy", "Eggs"],
        menu: [
            { id: "garden-salad", name: "Market Garden Salad", price: 12, category: "Starter", tags: ["Organic"] },
            {
                id: "garden-chicken",
                name: "Roast Chicken Plate",
                price: 21,
                category: "Main",
                tags: ["Family friendly"]
            },
            { id: "garden-cheesecake", name: "Honey Cheesecake", price: 8, category: "Dessert", tags: ["Sweet"] }
        ]
    },
    {
        id: 4,
        name: "Saffron Lane",
        cuisine: "Indian",
        rating: 4.9,
        hours: "1:00 PM - 11:30 PM",
        openingTime: "13:00",
        closingTime: "23:30",
        priceLevel: "$$$",
        distanceCategory: "Medium",
        location: "Old Town",
        image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80",
        badges: ["Spicy", "Private dining", "Chef special"],
        sustainabilityBadges: ["Locally Sourced"],
        allergenBadges: ["Dairy", "Nuts"],
        menu: [
            { id: "saffron-samosa", name: "Spiced Samosa Chaat", price: 10, category: "Starter", tags: ["Spicy"] },
            { id: "saffron-biryani", name: "Saffron Biryani", price: 22, category: "Main", tags: ["Chef special"] },
            { id: "saffron-kulfi", name: "Pistachio Kulfi", price: 7, category: "Dessert", tags: ["Sweet"] }
        ]
    },
    {
        id: 5,
        name: "Casa Verde",
        cuisine: "Mexican",
        rating: 4.5,
        hours: "12:00 PM - 12:00 AM",
        openingTime: "12:00",
        closingTime: "00:00",
        priceLevel: "$$",
        distanceCategory: "Far",
        location: "Riverside",
        image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=900&q=80",
        badges: ["Tacos", "Rooftop", "Late night"],
        sustainabilityBadges: ["Plastic Free", "Locally Sourced"],
        allergenBadges: ["Gluten", "Dairy"],
        menu: [
            { id: "casa-elote", name: "Street Corn Elote", price: 7, category: "Starter", tags: ["Vegetarian"] },
            { id: "casa-tacos", name: "Birria Taco Plate", price: 17, category: "Main", tags: ["Tacos"] },
            { id: "casa-churros", name: "Cinnamon Churros", price: 8, category: "Dessert", tags: ["Sweet"] }
        ]
    },
    {
        id: 6,
        name: "Bistro Lumiere",
        cuisine: "French",
        rating: 4.8,
        hours: "5:00 PM - 11:00 PM",
        openingTime: "17:00",
        closingTime: "23:00",
        priceLevel: "$$$$",
        distanceCategory: "Far",
        location: "Arts Quarter",
        image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80",
        badges: ["Fine dining", "Wine list", "Anniversary"],
        sustainabilityBadges: ["Eco Certified"],
        allergenBadges: ["Dairy", "Eggs"],
        menu: [
            { id: "bistro-soup", name: "French Onion Soup", price: 11, category: "Starter", tags: ["Classic"] },
            { id: "bistro-duck", name: "Duck Confit", price: 29, category: "Main", tags: ["Fine dining"] },
            { id: "bistro-creme", name: "Creme Brulee", price: 9, category: "Dessert", tags: ["Classic"] }
        ]
    }
];
