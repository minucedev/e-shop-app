# Agent Guidelines for E-Shop App

## Build/Lint/Test Commands
- **Start dev server**: `npm start` or `npx expo start`
- **Lint code**: `npm run lint` (uses ESLint with Expo config)
- **Run on Android**: `npm run android`
- **Run on iOS**: `npm run ios`
- **Run on web**: `npm run web`
- **Update backend IP**: `npm run update-ip`
- **No test framework configured** - run lint after changes

## Code Style Guidelines

### Language & Types
- **TypeScript** with strict mode enabled
- Use **interfaces** for API responses and component props
- **Type aliases** for complex union types
- Avoid `any` type - use proper typing

### Imports & Structure
- React imports first, then third-party libraries, then local imports
- Use `@/` path alias for imports (configured in tsconfig.json)
- Group imports: React, Expo, third-party, local components/services

### Naming Conventions
- **Components**: PascalCase (e.g., `ProductCard`, `AuthGuard`)
- **Functions/Variables**: camelCase (e.g., `formatPrice`, `handlePress`)
- **Types/Interfaces**: PascalCase (e.g., `ProductApiResponse`)
- **Files**: kebab-case for components (e.g., `product-card.tsx`)

### Components & Hooks
- Functional components with hooks
- Use `React.memo` for performance-critical components
- `useCallback` for event handlers passed as props
- Custom hooks in `/hooks` directory

### Styling
- **TailwindCSS** with NativeWind preset
- Use `className` prop (not `style`)
- Consistent spacing and color usage from `/constants`

### Error Handling
- Try-catch blocks in API service functions
- Error states in Context providers
- User-friendly error messages in UI

### State Management
- **React Context API** for global state
- Separate contexts for different domains (Auth, Product, Cart, etc.)
- AsyncStorage for persistence

### API Integration
- Centralized API client in `/services/apiClient.ts`
- Service functions return typed responses
- Error handling at service layer</content>
<parameter name="filePath">/mnt/e/University/HK1_Nam4/PBL6/hell/e-shop-app/AGENTS.md