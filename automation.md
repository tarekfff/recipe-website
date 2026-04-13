# Recipe Platform Automation Guide

This guide details exactly how to automate the Recipe Platform using tools like **n8n**, **Make.com**, **Zapier**, or custom scripts (Python, Node.js). 

---

## 🔑 Authentication

All Admin and Editor API endpoints require authentication. For automation bots, the system provides **API Keys** which are much simpler than logging in with a session.

1. Go to the Admin Dashboard > **Settings** > **API Keys**.
2. Generate a new API Key with the required permissions (e.g., "Full Access" or "Recipes Write").
3. Include the key in your HTTP requests using the `X-API-Key` header:

```http
X-API-Key: prefix_randomstringhere
```

---

## 📸 1. Uploading Images (Before Recipe Creation)

If your recipe has a featured image from another source, you should upload it to the platform first to get a hosted URL.

**Endpoint:** `POST /api/upload`  
**Headers:** `X-API-Key: <your_api_key>`  
**Body:** `multipart/form-data` 
- `file`: The image file itself.
- `name`: *(Optional)* A custom string for the filename (e.g., "creamy-red-lentil-soup"). If omitted, a random timestamp is used.

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/upload \
  -H "X-API-Key: your_api_key" \
  -F "file=@/path/to/your/image.jpg" \
  -F "name=creamy-red-lentil-soup"
```
**Response:**
```json
{
  "success": true,
  "url": "https://<your_storage_bucket>/image.jpg"
}
```

---

## 🍳 2. Creating a Recipe (With SEO)

This is the primary endpoint for your automation tools. You can pass the core recipe details, ingredients, SEO metadata, and the featured image URL obtained from the previous step.

**Endpoint:** `POST /api/recipes`  
**Headers:** 
- `X-API-Key: <your_api_key>`
- `Content-Type: application/json`

**JSON Body Example (All fields mapped from your n8n AI):**
```json
{
  // 1. Core Post Data (Replaces '/wp/v2/posts')
  "title": "{{ $json.title }}",
  "description": "{{ $json.meta_description }}",
  "content": "{{ $json.article_html }}",
  "featuredImage": "{{ $('all picture').first().json.feature.guid.rendered }}",
  "videoUrl": "https://youtube.com/...", // Optional
  
  "categoryId": "{{ $('category').first().json.category_id }}",
  "chefId": "cuid_here", // Get Chef ID from Admin > Chefs
  "status": "PUBLISHED", 
  "tagNames": ["{{ $json.category }}", "{{ $json.cuisine }}", "Keyword1"], // Replaces WP Taxonomies
  
  // 2. Recipe Card Data (Replaces WPRM '/wp/v2/wprm_recipe')
  "difficulty": "EASY", 
  "prepTime": 15,
  "cookTime": 30,
  "servings": 4,
  "calories": 350,
  
  "ingredients": [
    { "amount": "1", "unit": "cup", "name": "Flour" }
  ],
  "instructions": [
    { "step": 1, "text": "Mix ingredients..." }
  ],
  
  // 3. SEO & Schema Data (Replaces RankMath Meta + Schema endpoints)
  "seo": {
    "metaTitle": "{{ $json.seo_title }}",
    "metaDescription": "{{ $json.seo_description }}",
    "focusKeyword": "{{ $json.focus_keyword }}",
    "canonicalUrl": "{{ $json.canonical_url }}",
    "keywords": ["SEO", "Keywords", "Here"], // Tags for meta keywords
    "schemaEnabled": true // The frontend will automatically generate JSON-LD schema based on the recipe data!
  }
}
```
**Response:** Returns the full created recipe object including the generated `slug`.

### 💡 Why this is better than WordPress:
In your n8n workflow, you had to make **4 separate HTTP requests**:
1. `Create Recipe Card` (WPRM)
2. `Publish Post` (WP Posts)
3. `Update SEO` (RankMath Meta)
4. `Update Schema` (RankMath Schema)

With this custom platform, you just send the single **POST /api/recipes** payload above,. The platform automatically handles building the recipe card, rendering the semantic JSON-LD schema, and attaching the SEO focus keywords seamlessly!

---

## ✍️ 3. Updating an Existing Recipe

If your AI process runs repeatedly to enhance recipes, use the PUT endpoint. It accepts the exact same JSON body as the POST endpoint, but it updates the existing recipe instead.

**Endpoint:** `PUT /api/recipes/[slug]`  
*(e.g., `/api/recipes/creamy-red-lentil-soup`)*

**Headers:** 
- `X-API-Key: <your_api_key>`
- `Content-Type: application/json`

*(Pass only the fields you wish to update, or pass the full object including the improved `seo` chunk).*

---

## 📊 4. Analyzing Platform Performance

To run automated cron jobs that pull reports, check for pending reviews, or analyze the overall health of the recipes, use the Analytics API to extract JSON statistics.

**Endpoint:** `GET /api/analytics/overview`  
**Headers:** `X-API-Key: <your_api_key>`

**Response Example:**
```json
{
  "success": true,
  "data": {
    "recipes": {
      "total": 125,
      "published": 110,
      "draft": 15
    },
    "categories": 8,
    "chefs": 5,
    "feedback": {
      "pending": 3,
      "total": 450
    },
    "newsletter": {
      "total": 5000,
      "active": 4900
    },
    "topRecipes": [
      {
        "slug": "creamy-red-lentil-soup",
        "title": "Creamy Red Lentil Soup",
        "viewCount": 15403,
        "featuredImage": "https://...",
        "category": { "name": "Soups" }
      }
    ],
    "recentFeedback": [
      {
        "id": "cuid...",
        "recipe": { "title": "Creamy Red Lentil Soup" },
        "rating": 5,
        "comment": "Best soup ever!"
      }
    ]
  }
}
```

## 📋 5. Listing Recipes for Batch Processing

If you need your automation to loop over all published recipes (e.g., to generate Pinterest pins using AI):

**Endpoint:** `GET /api/recipes?limit=50&page=1`  
**(Public Endpoint - No API Key Required)**

*Query Parameters available:*
- `page`: Page number (default: 1)
- `limit`: Results per page (max 50)
- `category`: Filter by category slug
- `sortBy`: e.g. `viewCount`
- `order`: `asc` or `desc`

---

## 🗂️ 6. Listing Categories (WordPress Compatible)

If your external automation tools or plugins expect the **exact** WordPress REST API format, use this dedicated mock WP endpoint. It returns categories properly structured with numeric IDs and standard `_links` required by strict parsers.

**Endpoint:** `GET /api/wp-json/wp/v2/categories`  
**(Public Endpoint - No API Key Required)**

**Response Example:**
```json
[
  {
    "id": 1395819,
    "count": 8,
    "description": "Tasty recipes",
    "link": "https://localhost:3000/category/soups/",
    "name": "Soups",
    "slug": "soups",
    "taxonomy": "category",
    "parent": 0,
    "meta": [],
    "_links": {
      "self": [ { "href": "https://localhost:3000/api/wp-json/wp/v2/categories/1395819" } ]
    }
  }
]
```

---

## 🔗 7. Listing Posts for Internal Linking (WordPress Compatible)

If you use tools that automatically build internal links by scanning a WordPress site, they expect a specific `wp/v2/posts` endpoint returning URLs and rendered titles. This dedicated mock endpoint serves your published recipes in that exact configuration.

**Endpoint:** `GET /api/wp-json/wp/v2/posts`  
**(Public Endpoint - No API Key Required)**

**Response Example:**
```json
[
  {
    "link": "https://localhost:3000/recipes/creamy-red-lentil-soup/",
    "title": {
      "rendered": "Creamy Red Lentil Soup"
    }
  },
  {
    "link": "https://localhost:3000/recipes/best-healthy-banana-bread/",
    "title": {
      "rendered": "Best Healthy Banana Bread Recipe: Moist & Easy"
    }
  }
]
```

---

## Recommended Automation Workflow (n8n / Python)

1. **Trigger:** Webhook or schedule.
2. **AI Action:** Generate recipe components (Title, Description, HTML Content, Ingredients, Instructions, SEO).
3. **HTTP node (Upload Image):** Send AI-generated image to `POST /api/upload`. Extract the returning `url`.
4. **HTTP node (Create Recipe):** Send the generated JSON and Image URL to `POST /api/recipes` with your `X-API-Key`.
5. **Success!** Your fully formatted, SEO-optimized recipe is now live on the site.
