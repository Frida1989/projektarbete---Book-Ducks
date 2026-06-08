 Book Ducks

Book Ducks is a modern book web app built with HTML, CSS, JavaScript and Strapi CMS.

Users can:
- Explore books
- Create an account and log in
- Save books to a personal reading list
- Rate books from 1–10
- View their saved and rated books on a profile page

The project also includes:
- Average ratings
- Sorting functionality
- Admin-controlled themes
- Dark mode via Strapi CMS

---

 Built With

- HTML
- CSS
- JavaScript
- Axios
- Strapi CMS


---

 Run the Project

Backend

```bash
cd backend/my-strapi-project
npm install
npm run develop


Frontend
Open frontend/index.html with Live Server.

---

 Deploy the Project

Easiest setup:

1. Deploy the Strapi backend on Strapi Cloud.
   - Project folder: `backend/my-strapi-project`
   - Strapi Cloud can deploy from GitHub/GitLab, or with the Strapi CLI:
     ```bash
     cd backend/my-strapi-project
     npm run strapi login
     npm run strapi deploy
     ```

2. Copy the deployed Strapi URL, for example:
   ```txt
   https://your-project.strapiapp.com
   ```

3. Update the frontend config:
   ```js
   // frontend/config.js
   window.BOOK_DUCKS_CONFIG = {
     STRAPI_URL: "https://your-project.strapiapp.com",
   };
   ```

4. Deploy the `frontend` folder as a static site on Netlify.
   - Use drag and drop for the quickest deploy.
   - Drag the `frontend` folder, because it contains `index.html`.

Important:

- Do not commit `.env` files.
- If any real secrets were committed or shared, generate new Strapi secrets before publishing.
- The frontend must use the public Strapi URL, not `localhost`.

 Created by Farideh Pakdaman
