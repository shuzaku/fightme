# Authentication System

This document describes the new authentication system implemented in the Vue Fighters Edge application.

## Overview

The authentication system provides:
- JWT token-based authentication
- Role-based permissions
- Automatic token management
- Fallback to Firebase authentication
- Permission guards for UI components

## Services

### AuthService (`src/services/auth-service.ts`)

Main authentication service that handles:
- User login with email/password
- Token storage and retrieval
- User data management
- Authenticated API requests
- Permission checking

#### Key Methods

```typescript
// Login user
await AuthService.login(email, password)

// Check if user is authenticated
AuthService.isAuthenticated()

// Get current user
AuthService.getUser()

// Logout user
AuthService.logout()

// Make authenticated requests
await AuthService.makeAuthenticatedRequest(url, options)

// Check permissions
AuthService.canUserCreateVideos()
AuthService.isAdmin()
AuthService.hasRole('admin')
```

### PermissionsService (`src/services/permissions-service.ts`)

Handles role-based permissions and access control:

```typescript
// Check if user can create videos
PermissionsService.canCreateVideos()

// Check if user is admin
PermissionsService.isAdmin()

// Check specific action on resource
PermissionsService.canPerformAction('create', 'videos')

// Check content ownership
PermissionsService.canEditContent('videos', contentOwnerId)
```

### Updated Api Service (`src/services/Api.ts`)

The API service now automatically:
- Includes authentication headers in all requests
- Handles 401 errors by clearing auth data
- Redirects to login on authentication failure

## Components

### AuthGuard (`src/components/common/auth-guard.vue`)

A wrapper component that conditionally renders content based on permissions:

```vue
<AuthGuard action="create" resource="videos">
  <v-btn>Create Video</v-btn>
</AuthGuard>

<AuthGuard action="edit" resource="videos" :content-owner-id="userId">
  <v-btn>Edit Video</v-btn>
</AuthGuard>
```

### Updated Login Component (`src/components/account/login.vue`)

The login component now:
- Tries the new auth strategy first
- Falls back to Firebase if needed
- Handles password reset requirements
- Shows loading states
- Manages error messages

## Usage Examples

### Basic Authentication Check

```vue
<template>
  <div v-if="isAuthenticated">
    Welcome, {{ user.displayName }}!
  </div>
  <div v-else>
    Please log in
  </div>
</template>

<script>
import AuthService from '@/services/auth-service';

export default {
  computed: {
    isAuthenticated() {
      return AuthService.isAuthenticated();
    },
    user() {
      return AuthService.getUser();
    }
  }
};
</script>
```

### Permission-Based Rendering

```vue
<template>
  <div>
    <!-- Using AuthGuard component -->
    <AuthGuard action="create" resource="videos">
      <v-btn>Create Video</v-btn>
    </AuthGuard>

    <!-- Using computed properties -->
    <v-btn v-if="canCreateVideos" @click="createVideo">
      Create Video
    </v-btn>
  </div>
</template>

<script>
import PermissionsService from '@/services/permissions-service';

export default {
  computed: {
    canCreateVideos() {
      return PermissionsService.canCreateVideos();
    }
  }
};
</script>
```

### Making Authenticated API Calls

```vue
<script>
import AuthService from '@/services/auth-service';

export default {
  methods: {
    async fetchData() {
      try {
        // Using the updated Api service (automatic auth headers)
        const response = await this.$http.get('/api/data');
        return response.data;
      } catch (error) {
        console.error('API Error:', error);
      }
    },

    async fetchCustomData() {
      try {
        // Using AuthService for custom requests
        const response = await AuthService.makeAuthenticatedRequest('/api/custom');
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Custom API Error:', error);
      }
    }
  }
};
</script>
```

## Backend Integration

The frontend expects the backend to provide:

### Login Endpoint (`POST /auth/login`)

Request:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response (Success):
```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "role": "user",
    "displayName": "User Name"
  }
}
```

Response (Password Reset Required):
```json
{
  "needsPasswordReset": true
}
```

### Token Refresh Endpoint (`POST /auth/refresh`)

Request: Include `Authorization: Bearer <token>` header

Response:
```json
{
  "token": "new-jwt-token"
}
```

## Role System

The system supports the following roles:
- `admin`: Full access to all features
- `moderator`: Can moderate content and manage some resources
- `user`: Can create and edit their own content

## Security Features

- JWT tokens stored in localStorage
- Automatic token inclusion in API requests
- 401 error handling with automatic logout
- Role-based permission checking
- Content ownership validation

## Migration from Firebase

The system maintains backward compatibility with Firebase authentication:
1. New auth strategy is tried first
2. If it fails, falls back to Firebase
3. Both systems can coexist during transition period

## Error Handling

- Network errors are caught and logged
- 401 errors trigger automatic logout
- Permission errors show user-friendly messages
- Loading states prevent multiple requests

## Best Practices

1. Always check authentication before making API calls
2. Use AuthGuard component for permission-based UI
3. Handle loading and error states appropriately
4. Validate permissions on both frontend and backend
5. Clear sensitive data on logout

