import AuthService from '@/services/auth-service';

export interface Permission {
  action: string;
  resource: string;
}

class PermissionsService {
  /**
   * Check if user can create videos
   */
  canCreateVideos(): boolean {
    return AuthService.canUserCreateVideos();
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return AuthService.isAdmin();
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    return AuthService.hasRole(role);
  }

  /**
   * Check if user can perform action on resource
   */
  canPerformAction(action: string, resource: string): boolean {
    const user = AuthService.getUser();
    if (!user) return false;

    // Admin can do everything
    if (user.role === 'admin') return true;

    // Define permission matrix
    const permissions: Record<string, string[]> = {
      'create': ['videos', 'characters', 'combos', 'articles'],
      'edit': ['videos', 'characters', 'combos', 'articles', 'profile'],
      'delete': ['videos', 'characters', 'combos', 'articles'],
      'moderate': ['comments', 'reports'],
      'manage': ['users', 'tournaments', 'events']
    };

    const allowedResources = permissions[action] || [];
    const hasResourcePermission = allowedResources.includes(resource);

    // User role permissions
    const rolePermissions: Record<string, string[]> = {
      'user': ['create', 'edit'],
      'moderator': ['create', 'edit', 'moderate'],
      'admin': ['create', 'edit', 'delete', 'moderate', 'manage']
    };

    const userActions = rolePermissions[user.role] || [];
    const hasActionPermission = userActions.includes(action);

    return hasActionPermission && hasResourcePermission;
  }

  /**
   * Check if user can edit specific content
   */
  canEditContent(contentType: string, contentOwnerId?: string): boolean {
    const user = AuthService.getUser();
    if (!user) return false;

    // Admin can edit everything
    if (user.role === 'admin') return true;

    // Users can edit their own content
    if (contentOwnerId && user.id === contentOwnerId) {
      return this.canPerformAction('edit', contentType);
    }

    return false;
  }

  /**
   * Check if user can delete specific content
   */
  canDeleteContent(contentType: string, contentOwnerId?: string): boolean {
    const user = AuthService.getUser();
    if (!user) return false;

    // Admin can delete everything
    if (user.role === 'admin') return true;

    // Users can delete their own content
    if (contentOwnerId && user.id === contentOwnerId) {
      return this.canPerformAction('delete', contentType);
    }

    return false;
  }

  /**
   * Get user's available actions for a resource
   */
  getAvailableActions(resource: string): string[] {
    const user = AuthService.getUser();
    if (!user) return [];

    const actions = ['create', 'edit', 'delete', 'moderate', 'manage'];
    return actions.filter(action => this.canPerformAction(action, resource));
  }

  /**
   * Check if user can access admin panel
   */
  canAccessAdminPanel(): boolean {
    return this.hasRole('admin') || this.hasRole('moderator');
  }

  /**
   * Check if user can moderate content
   */
  canModerate(): boolean {
    return this.canPerformAction('moderate', 'comments') || this.canPerformAction('moderate', 'reports');
  }
}

export default new PermissionsService();

