# Insider Network Viewer

An interactive web app to explore trading networks between corporate insiders.  
Built with **Next.js**, **Sigma.js**, and **Graphology**, and deployed via **Vercel**.

---

## Overview

This project visualises insider trading networks derived from SEC insider trade filings (2014–2024).  
Edges in the network represent temporal similarity in trading patterns between insiders within the same company.  
The site allows you to:

- Search for a **company** (by name or ticker).
- Browse its **connected components** (subgraphs).
- Interactively explore insiders and their trading links.

All graph data is preprocessed into JSON files for fast loading in the browser.

---

## Project Structure

