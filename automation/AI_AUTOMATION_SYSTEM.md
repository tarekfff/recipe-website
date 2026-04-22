# 🤖 AI Automation System: The Content Engine

This document provides a comprehensive overview of the hyper-automation pipeline that powers **Graceful Recipes**. The system is designed to take a simple dish name and perform a full "Zero to Hero" publishing process without human intervention.

---

## 🔄 The Automation Lifecycle

The entire workflow is managed by **n8n** (orchestration) and **Google Gemini** (intelligence).

### 1. Keyword Acquisition & Validation
- **Source**: A Google Sheet containing recipe titles.
- **Validation**: The system uses a specialized AI agent to verify if the keyword represents a real, cookable dish.
- **Rules Engine**: The AI automatically reinterpret recipes to match compliance standards (e.g., automatically substituting pork or alcohol for family-friendly alternatives).

### 2. Multi-Stage Content Generation
The system doesn't just "write" a blog post; it builds a structured experience:
- **Article Generation**: Gemini produces a long-form SEO article with H1-H3 structure, metadata, and internal links to existing site content.
- **Data Extraction**: A secondary agent "reads" the generated article to extract structured JSON data (prep time, cook time, calories, macros, ingredient list, and step-by-step instructions).

### 3. Dynamic Imagery Pipeline
Using **Gemini-3.1-Flash-Image-Preview**, the system generates 4 consistent images for each recipe:
1. **Feature Image**: Cinematic hero shot.
2. **Ingredients**: Professionally styled overhead shot.
3. **Cooking**: Action shot of the preparation.
4. **Final Presentation**: Plated restaurant-quality shot.
*All images are automatically watermarked with the site domain and converted to **WebP** for performance.*

### 4. Multichannel Distribution (Pinterest)
Once live, the system continues:
- **Pinterest Logic**: AI analyzes the recipe to choose the best-matching Pinterest board.
- **Asset Creation**: Generates a dedicated Pinterest-optimized vertical pin (2:3 aspect ratio).
- **Posting**: Automatically pushes the content to Pinterest via a Make.com integration.

### 5. Manual Override & Refinement
At any point, a human editor can log into the **Master Admin Dashboard** to:
- Review and refine AI-generated content before or after publishing.
- Manually trigger or adjust SEO settings.
- Manage site-wide branding (names, logos) that the AI respects during content generation.

---

## 🧠 Key Logic Components

### Compliance Filter (The "Safe-Guard")
The system includes a mandatory check to ensure all content is family-safe:
- **Banned Ingredients**: Pork, Alcohol, Lard, etc.
- **Smart Substitutions**: 
  - Pork → Lamb/Beef
  - Wine → Grape Juice/Broth
  - Holiday terms (Christmas/Easter) → Seasonal neutral terms (Winter/Spring)
- **Zero-Footprint**: The substitutions happen silently, so the final article reads naturally without mentioning the replacements.

### Internal Linking Strategy
The AI agent is fed a dynamic list of existing posts from the `/api/wp-json/wp/v2/posts` endpoint. It naturally embeds 3–5 relevant internal links within every new article to boost SEO relevance and user retention.

---

## 🛠️ Architecture overview
- **n8n**: The central nervous system connecting Google Sheets, Gemini, and the Recipe Platform API.
- **Convertio API**: Handles real-time conversion of AI images to high-efficiency WebP.
- **Custom API**: The platform provides a unified `POST /api/recipes` endpoint that accepts the entire AI package in one request.

---

## 📈 Impact
This system allows for **infinite scaling** of high-quality, niche-specific culinary content with zero manual writing or photography costs.
