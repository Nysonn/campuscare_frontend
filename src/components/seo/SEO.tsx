import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'CampusCare';
const DEFAULT_IMAGE = 'https://campuscare.me/logo.png';
const DEFAULT_URL = 'https://campuscare.me';
const TWITTER_SITE = '@campuscare_me';
const THEME_COLOR = '#27ae60';

const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'CampusCare',
  url: 'https://campuscare.me',
  logo: 'https://campuscare.me/logo.png',
  description:
    'University-based crowdfunding platform for student and staff mental health support services in Uganda',
  foundingLocation: {
    '@type': 'Place',
    name: 'Mbarara, Uganda',
  },
  sameAs: [],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'isaac@campuscare.me',
    telephone: '+256708055707',
    contactType: 'customer support',
  },
};

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  noindex?: boolean;
  includeOrgSchema?: boolean;
  additionalSchemas?: object[];
}

export default function SEO({
  title,
  description,
  keywords,
  image = DEFAULT_IMAGE,
  url = DEFAULT_URL,
  type = 'website',
  noindex = false,
  includeOrgSchema = false,
  additionalSchemas = [],
}: SEOProps) {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const robotsContent = noindex ? 'noindex,nofollow' : 'index,follow';

  const schemas: object[] = [];
  if (includeOrgSchema) schemas.push(ORGANIZATION_SCHEMA);
  schemas.push(...additionalSchemas);

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />
      <meta name="robots" content={robotsContent} />
      <meta name="author" content={SITE_NAME} />
      <meta name="theme-color" content={THEME_COLOR} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_UG" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content={TWITTER_SITE} />

      {/* JSON-LD schemas */}
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
