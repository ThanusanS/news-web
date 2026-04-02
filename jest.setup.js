import '@testing-library/jest-dom';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({ pathname: '/', push: jest.fn(), replace: jest.fn(), query: {}, asPath: '/' }),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }) => <img src={src} alt={alt} {...props} />,
}));

// Mock appwrite
jest.mock('./src/lib/appwrite', () => ({
  databases: { listDocuments: jest.fn(), getDocument: jest.fn(), createDocument: jest.fn(), updateDocument: jest.fn(), deleteDocument: jest.fn() },
  storage: { listFiles: jest.fn(), getFilePreview: jest.fn(() => ({ href: '' })) },
  account: { get: jest.fn(), createEmailPasswordSession: jest.fn(), deleteSession: jest.fn() },
  Query: { equal: jest.fn(), orderDesc: jest.fn(), limit: jest.fn(), offset: jest.fn(), search: jest.fn() },
  ID: { unique: jest.fn(() => 'test-id') },
  DB_ID: 'test-db',
  ARTICLES_COL: 'articles',
  SUBSCRIBERS_COL: 'subscribers',
  COMMENTS_COL: 'comments',
}));

// Suppress console errors in tests
const originalError = console.error;
beforeAll(() => { console.error = (...args) => { if (args[0]?.includes?.('Warning:')) return; originalError(...args); }; });
afterAll(() => { console.error = originalError; });
