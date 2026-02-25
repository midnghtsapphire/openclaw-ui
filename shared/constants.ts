export const SUBSCRIPTION_TIERS = {
  free: { name: "Free", price: 0, tokens: 100, agents: 1, connectors: 3 },
  standard: { name: "Standard", price: 200, tokens: 10000, agents: 5, connectors: 15 },
  enterprise: { name: "Enterprise", price: 400, tokens: 50000, agents: 25, connectors: 50 },
  premium: { name: "Premium", price: 1500, tokens: 250000, agents: 100, connectors: 200 },
} as const;

export const CONNECTOR_TYPES = [
  { id: "openrouter", name: "OpenRouter", icon: "Brain", category: "AI Models", description: "Access 200+ LLMs through a single API" },
  { id: "elevenlabs", name: "ElevenLabs", icon: "Volume2", category: "Voice", description: "Text-to-speech and voice synthesis" },
  { id: "github", name: "GitHub", icon: "Github", category: "Development", description: "Repository management and CI/CD" },
  { id: "gitlab", name: "GitLab", icon: "GitBranch", category: "Development", description: "DevOps platform integration" },
  { id: "google-drive", name: "Google Drive", icon: "HardDrive", category: "Storage", description: "Cloud file storage and sharing" },
  { id: "gmail", name: "Gmail", icon: "Mail", category: "Communication", description: "Email automation and management" },
  { id: "slack", name: "Slack", icon: "MessageSquare", category: "Communication", description: "Team messaging and notifications" },
  { id: "discord", name: "Discord", icon: "Headphones", category: "Communication", description: "Community and bot integration" },
  { id: "telegram", name: "Telegram", icon: "Send", category: "Communication", description: "Messaging bot and channel management" },
  { id: "twilio", name: "Twilio SMS", icon: "Phone", category: "Communication", description: "SMS and voice calling" },
  { id: "stripe", name: "Stripe", icon: "CreditCard", category: "Payments", description: "Payment processing and billing" },
  { id: "notion", name: "Notion", icon: "FileText", category: "Productivity", description: "Knowledge base and project management" },
] as const;

export const RENTAL_CATEGORIES = [
  { id: "phone-answering", name: "Phone Answering", icon: "Phone", priceRange: "$5-15/hr" },
  { id: "marketing", name: "Marketing", icon: "Megaphone", priceRange: "$10-25/hr" },
  { id: "inventory", name: "Inventory Management", icon: "Package", priceRange: "$8-20/hr" },
  { id: "dental", name: "Dental Office", icon: "Stethoscope", priceRange: "$12-30/hr" },
  { id: "legal", name: "Legal Office", icon: "Scale", priceRange: "$15-40/hr" },
  { id: "restaurant", name: "Restaurant", icon: "UtensilsCrossed", priceRange: "$5-15/hr" },
  { id: "real-estate", name: "Real Estate", icon: "Building", priceRange: "$10-25/hr" },
  { id: "customer-support", name: "Customer Support", icon: "Headset", priceRange: "$5-12/hr" },
  { id: "research", name: "Research", icon: "Search", priceRange: "$15-35/hr" },
  { id: "data-entry", name: "Data Entry", icon: "Database", priceRange: "$3-8/hr" },
] as const;
