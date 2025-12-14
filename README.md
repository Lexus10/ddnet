# DDNet Archive

## Local Development

This project uses Cloudflare Pages Functions for player stats API. To run locally:

1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

2. Run the development server:
   ```bash
   wrangler pages dev
   ```

3. Open the local URL shown in the terminal (usually `http://localhost:8788`).

**Note:** For testing the API endpoint, use `http://localhost:8788/api/player?name=PlayerName`

## Deployment

Deploy to Cloudflare Pages - the functions in `/functions` will be automatically built and deployed.

