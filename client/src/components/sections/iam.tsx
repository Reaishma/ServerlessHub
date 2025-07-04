import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus, Settings, Edit, Trash2, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";

export default function IAM() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ["/api/iam/users"],
  });

  const { data: serviceAccounts = [] } = useQuery({
    queryKey: ["/api/iam/service-accounts"],
  });

  const addUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await apiRequest("POST", "/api/iam/users", userData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/iam/users"] });
      toast({
        title: "Success",
        description: "User added successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add user",
        variant: "destructive",
      });
    },
  });

  const createServiceAccountMutation = useMutation({
    mutationFn: async (accountData: any) => {
      const response = await apiRequest("POST", "/api/iam/service-accounts", accountData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/iam/service-accounts"] });
      toast({
        title: "Success",
        description: "Service account created successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create service account",
        variant: "destructive",
      });
    },
  });

  const updateSecurityPoliciesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/iam/security-policies", {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Security policies updated successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update security policies",
        variant: "destructive",
      });
    },
  });

  const handleAddUser = () => {
    const email = prompt("Enter user email:");
    if (email) {
      const role = prompt("Select role (Owner/Editor/Viewer):") || "Viewer";
      addUserMutation.mutate({ email, role });
    }
  };

  const handleCreateServiceAccount = () => {
    const name = prompt("Enter service account name:");
    if (name) {
      createServiceAccountMutation.mutate({
        name,
        email: `${name}@project.iam.gserviceaccount.com`,
        roles: ["Cloud Functions Invoker"],
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Owner":
        return "gcp-status-error";
      case "Editor":
        return "gcp-status-warning";
      case "Viewer":
        return "gcp-status-info";
      default:
        return "gcp-status-info";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "gcp-status-success";
      case "Pending":
        return "gcp-status-info";
      case "Disabled":
        return "gcp-status-error";
      default:
        return "gcp-status-info";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Identity & Access Management</h2>
        <p className="text-gray-600">Manage user permissions and security policies</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users & Permissions */}
        <Card className="gcp-card">
          <CardHeader className="gcp-card-header flex flex-row items-center justify-between">
            <CardTitle>Users & Permissions</CardTitle>
            <Button
              onClick={handleAddUser}
              size="sm"
              className="gcp-btn-primary"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </CardHeader>
          <CardContent className="gcp-card-body">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-2">Email</th>
                    <th className="text-left py-2 px-2">Role</th>
                    <th className="text-left py-2 px-2">Status</th>
                    <th className="text-left py-2 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: any) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-2 text-sm">{user.email}</td>
                      <td className="py-2 px-2">
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-2 px-2">
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                          {user.email !== "vra.9618@gmail.com" && (
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Service Accounts */}
        <Card className="gcp-card">
          <CardHeader className="gcp-card-header flex flex-row items-center justify-between">
            <CardTitle>Service Accounts</CardTitle>
            <Button
              onClick={handleCreateServiceAccount}
              size="sm"
              className="gcp-btn-primary"
            >
              <Settings className="h-4 w-4 mr-2" />
              Create Account
            </Button>
          </CardHeader>
          <CardContent className="gcp-card-body">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-2">Name</th>
                    <th className="text-left py-2 px-2">Email</th>
                    <th className="text-left py-2 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceAccounts.map((account: any) => (
                    <tr key={account.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-2 font-medium text-sm">{account.name}</td>
                      <td className="py-2 px-2 text-sm">{account.email}</td>
                      <td className="py-2 px-2">
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Key className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Policies */}
      <Card className="gcp-card">
        <CardHeader className="gcp-card-header">
          <CardTitle>Security Policies</CardTitle>
        </CardHeader>
        <CardContent className="gcp-card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Authentication</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="mfa" defaultChecked />
                  <label htmlFor="mfa" className="text-sm">
                    Require MFA for admin accounts
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="password-rotation" defaultChecked />
                  <label htmlFor="password-rotation" className="text-sm">
                    Force password rotation (90 days)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="oauth" />
                  <label htmlFor="oauth" className="text-sm">
                    Allow external OAuth providers
                  </label>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Access Control</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="audit-logging" defaultChecked />
                  <label htmlFor="audit-logging" className="text-sm">
                    Enable audit logging
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="ip-restriction" defaultChecked />
                  <label htmlFor="ip-restriction" className="text-sm">
                    Restrict API access by IP
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="cross-project" />
                  <label htmlFor="cross-project" className="text-sm">
                    Enable cross-project access
                  </label>
                </div>
              </div>
            </div>
          </div>
          <Button
            onClick={() => updateSecurityPoliciesMutation.mutate()}
            disabled={updateSecurityPoliciesMutation.isPending}
            className="gcp-btn-primary mt-4"
          >
            <Settings className="h-4 w-4 mr-2" />
            Save Policies
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
