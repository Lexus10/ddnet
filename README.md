# DDNet Archive

## Local Development

This project uses Netlify Functions for player stats API. To run locally:

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Run the development server:
   ```bash
   netlify dev
   ```

3. Open `http://localhost:8888` in your browser.

**Note:** Do not use "Go Live" or similar simple HTTP servers. The Netlify Functions require the Netlify dev server to work properly.

## Deployment

Deploy to Netlify - the functions will be automatically built and deployed.

