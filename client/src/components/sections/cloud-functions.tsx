import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Rocket, Play, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";

export default function CloudFunctions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [functionName, setFunctionName] = useState("");
  const [runtime, setRuntime] = useState("Node.js 18");
  const [trigger, setTrigger] = useState("HTTP Trigger");
  const [code, setCode] = useState("");

  const { data: functions = [], isLoading } = useQuery({
    queryKey: ["/api/functions"],
  });

  const deployMutation = useMutation({
    mutationFn: async (functionData: any) => {
      const response = await apiRequest("POST", "/api/functions", functionData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/functions"] });
      toast({
        title: "Success",
        description: "Function deployed successfully!",
      });
      setFunctionName("");
      setCode("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to deploy function",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/functions/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/functions"] });
      toast({
        title: "Success",
        description: "Function deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete function",
        variant: "destructive",
      });
    },
  });

  const handleDeploy = () => {
    if (!functionName || !code) {
      toast({
        title: "Error",
        description: "Please fill in function name and code",
        variant: "destructive",
      });
      return;
    }

    deployMutation.mutate({
      name: functionName,
      runtime,
      trigger,
      code,
    });
  };

  const handleTest = (functionName: string) => {
    toast({
      title: "Function Test",
      description: `Testing function: ${functionName}`,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this function?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Cloud Functions</h2>
        <p className="text-gray-600">Manage and deploy serverless functions</p>
      </div>

      {/* Create Function */}
      <Card className="gcp-card">
        <CardHeader className="gcp-card-header flex flex-row items-center justify-between">
          <CardTitle>Create New Function</CardTitle>
          <Button
            onClick={handleDeploy}
            disabled={deployMutation.isPending}
            className="gcp-btn-primary"
          >
            <Rocket className="h-4 w-4 mr-2" />
            Deploy Function
          </Button>
        </CardHeader>
        <CardContent className="gcp-card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="functionName">Function Name</Label>
              <Input
                id="functionName"
                value={functionName}
                onChange={(e) => setFunctionName(e.target.value)}
                placeholder="my-function"
              />
            </div>
            <div>
              <Label htmlFor="runtime">Runtime</Label>
              <Select value={runtime} onValueChange={setRuntime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Node.js 18">Node.js 18</SelectItem>
                  <SelectItem value="Python 3.9">Python 3.9</SelectItem>
                  <SelectItem value="Go 1.19">Go 1.19</SelectItem>
                  <SelectItem value="Java 11">Java 11</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mb-4">
            <Label htmlFor="trigger">Trigger Type</Label>
            <Select value={trigger} onValueChange={setTrigger}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HTTP Trigger">HTTP Trigger</SelectItem>
                <SelectItem value="Cloud Storage">Cloud Storage</SelectItem>
                <SelectItem value="Cloud Pub/Sub">Cloud Pub/Sub</SelectItem>
                <SelectItem value="Cloud Firestore">Cloud Firestore</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="code">Source Code</Label>
            <Textarea
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={8}
              placeholder="exports.helloWorld = (req, res) => {
  res.status(200).send('Hello, World!');
};"
            />
          </div>
        </CardContent>
      </Card>

      {/* Deployed Functions */}
      <Card className="gcp-card">
        <CardHeader className="gcp-card-header">
          <CardTitle>Deployed Functions</CardTitle>
        </CardHeader>
        <CardContent className="gcp-card-body">
          {isLoading ? (
            <div>Loading functions...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-4">Name</th>
                    <th className="text-left py-2 px-4">Runtime</th>
                    <th className="text-left py-2 px-4">Trigger</th>
                    <th className="text-left py-2 px-4">Status</th>
                    <th className="text-left py-2 px-4">Last Deployed</th>
                    <th className="text-left py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {functions.map((func: any) => (
                    <tr key={func.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-4 font-medium">{func.name}</td>
                      <td className="py-2 px-4">{func.runtime}</td>
                      <td className="py-2 px-4">{func.trigger}</td>
                      <td className="py-2 px-4">
                        <Badge className="gcp-status-success">
                          {func.status}
                        </Badge>
                      </td>
                      <td className="py-2 px-4">
                        {new Date(func.deployed).toLocaleString()}
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTest(func.name)}
                          >
                            <Play className="h-4 w-4" />
                            Test
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(func.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
