# Magis Data Intelligence

Next.js-website voor Gerhard Magis, opgezet als portfolio- en contactsite met een blog dat via Decap CMS beheerd kan worden.

## Starten

```bash
npm install
npm run dev
```

## Belangrijk

- De contactpagina gebruikt standaard `gerhard@magisdataintelligence.nl` als fallback-adres.
- Je kunt dit overschrijven met `NEXT_PUBLIC_CONTACT_EMAIL`.
- Decap CMS staat op `/admin`.

## Decap CMS lokaal gebruiken

Gebruik voor lokaal CMS-beheer naast de Next.js devserver ook de Decap proxy:

```bash
npx decap-server
```

Daarna kun je `/admin` openen.

Let op:

- `decap` is geen geldig npm-package, daarom krijg je een `E404`.
- Voor de CMS-interface gebruik ik hier een CDN-script in [index.html](/E:/WebsitePapa2/public/admin/index.html), dus je hoeft lokaal geen `decap` te installeren.
- Als je Decap expliciet via npm wilt gebruiken, neem dan `decap-cms` of `decap-cms-app`.
- Voor alleen de lokale proxyserver gebruik je `decap-server`.

Voor productie moet de `backend` in [config.yml](/E:/WebsitePapa2/public/admin/config.yml) worden afgestemd op de gekozen hosting- en gitopzet.
