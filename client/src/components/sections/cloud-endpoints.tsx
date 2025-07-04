import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Play, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";

export default function CloudEndpoints() {
  const { toast } = useToast();
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState("");
  const [body, setBody] = useState("");

  const { data: endpoints = [] } = useQuery({
    queryKey: ["/api/endpoints"],
  });

  const testMutation = useMutation({
    mutationFn: async (testData: any) => {
      const response = await apiRequest("POST", "/api/endpoints/test", testData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "API Test Results",
        description: `Status: ${data.status} | Response Time: ${data.responseTime}ms`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to test API",
        variant: "destructive",
      });
    },
  });

  const handleTest = () => {
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter an endpoint URL",
        variant: "destructive",
      });
      return;
    }

    testMutation.mutate({
      method,
      url,
      headers,
      body,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Cloud Endpoints</h2>
        <p className="text-gray-600">Manage API endpoints and monitor traffic</p>
      </div>

      {/* API Testing Console */}
      <Card className="gcp-card">
        <CardHeader className="gcp-card-header">
          <CardTitle>API Testing Console</CardTitle>
        </CardHeader>
        <CardContent className="gcp-card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="method">HTTP Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="url">Endpoint URL</Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api.example.com/users"
              />
            </div>
          </div>
          <div className="mb-4">
            <Label htmlFor="headers">Request Headers</Label>
            <Textarea
              id="headers"
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              rows={3}
              placeholder="Content-Type: application/json
Authorization: Bearer token"
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="body">Request Body</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              placeholder='{"name": "John Doe", "email": "john@example.com"}'
            />
          </div>
          <Button
            onClick={handleTest}
            disabled={testMutation.isPending}
            className="gcp-btn-primary"
          >
            <Play className="h-4 w-4 mr-2" />
            Send Request
          </Button>
        </CardContent>
      </Card>

      {/* API Endpoints */}
      <Card className="gcp-card">
        <CardHeader className="gcp-card-header">
          <CardTitle>API Endpoints</CardTitle>
        </CardHeader>
        <CardContent className="gcp-card-body">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-4">Endpoint</th>
                  <th className="text-left py-2 px-4">Method</th>
                  <th className="text-left py-2 px-4">Status</th>
                  <th className="text-left py-2 px-4">Requests/min</th>
                  <th className="text-left py-2 px-4">Avg Response Time</th>
                  <th className="text-left py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {endpoints.map((endpoint: any) => (
                  <tr key={endpoint.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-4 font-medium">{endpoint.path}</td>
                    <td className="py-2 px-4">
                      <Badge variant="outline">{endpoint.method}</Badge>
                    </td>
                    <td className="py-2 px-4">
                      <Badge className={
                        endpoint.status === "Healthy" ? "gcp-status-success" : 
                        endpoint.status === "Slow" ? "gcp-status-warning" : 
                        "gcp-status-error"
                      }>
                        {endpoint.status}
                      </Badge>
                    </td>
                    <td className="py-2 px-4">{endpoint.requestsPerMin}</td>
                    <td className="py-2 px-4">{endpoint.avgResponseTime}ms</td>
                    <td className="py-2 px-4">
                      <Button size="sm" variant="outline">
                        <Activity className="h-4 w-4 mr-2" />
                        Monitor
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
