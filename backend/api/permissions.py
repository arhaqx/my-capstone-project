from rest_framework import permissions

class IsSuperadminRole(permissions.BasePermission):
    """
    Allows access only to superadmin users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_superadmin)

class IsAdminRole(permissions.BasePermission):
    """
    Allows access to admin and superadmin users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin_or_higher)
