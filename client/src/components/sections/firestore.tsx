import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, Play, Folder } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";

export default function Firestore() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const [collectionName, setCollectionName] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [documentData, setDocumentData] = useState("");
  const [queryField, setQueryField] = useState("");
  const [queryOperator, setQueryOperator] = useState("==");
  const [queryValue, setQueryValue] = useState("");

  const { data: collections = [] } = useQuery({
    queryKey: ["/api/collections"],
  });

  const { data: documents = [] } = useQuery({
    queryKey: ["/api/collections", selectedCollection?.id, "documents"],
    enabled: !!selectedCollection,
  });

  const createCollectionMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest("POST", "/api/collections", { name });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collections"] });
      toast({
        title: "Success",
        description: "Collection created successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create collection",
        variant: "destructive",
      });
    },
  });

  const createDocumentMutation = useMutation({
    mutationFn: async (docData: any) => {
      const response = await apiRequest("POST", `/api/collections/${selectedCollection.id}/documents`, docData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collections", selectedCollection?.id, "documents"] });
      toast({
        title: "Success",
        description: "Document created successfully!",
      });
      setDocumentId("");
      setDocumentData("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create document",
        variant: "destructive",
      });
    },
  });

  const executeQueryMutation = useMutation({
    mutationFn: async (queryData: any) => {
      const response = await apiRequest("POST", "/api/query", queryData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Query Results",
        description: `Found ${data.count} documents`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to execute query",
        variant: "destructive",
      });
    },
  });

  const handleCreateCollection = () => {
    const name = prompt("Enter collection name:");
    if (name) {
      createCollectionMutation.mutate(name);
    }
  };

  const handleCreateDocument = () => {
    if (!selectedCollection || !documentData) {
      toast({
        title: "Error",
        description: "Please select a collection and enter document data",
        variant: "destructive",
      });
      return;
    }

    try {
      const data = JSON.parse(documentData);
      createDocumentMutation.mutate({
        documentId: documentId || `doc_${Date.now()}`,
        data,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid JSON format in document data",
        variant: "destructive",
      });
    }
  };

  const handleExecuteQuery = () => {
    if (!selectedCollection || !queryField || !queryValue) {
      toast({
        title: "Error",
        description: "Please fill in all query parameters",
        variant: "destructive",
      });
      return;
    }

    executeQueryMutation.mutate({
      collectionId: selectedCollection.id,
      field: queryField,
      operator: queryOperator,
      value: queryValue,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Cloud Firestore</h2>
        <p className="text-gray-600">NoSQL document database operations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Collections */}
        <Card className="gcp-card">
          <CardHeader className="gcp-card-header flex flex-row items-center justify-between">
            <CardTitle>Collections</CardTitle>
            <Button
              onClick={handleCreateCollection}
              size="sm"
              className="gcp-btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Collection
            </Button>
          </CardHeader>
          <CardContent className="gcp-card-body">
            <div className="space-y-2">
              {collections.map((collection: any) => (
                <div
                  key={collection.id}
                  className={`flex items-center gap-2 p-3 rounded-md border cursor-pointer hover:bg-gray-50 ${
                    selectedCollection?.id === collection.id ? "bg-blue-50 border-blue-200" : "border-gray-200"
                  }`}
                  onClick={() => setSelectedCollection(collection)}
                >
                  <Folder className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{collection.name}</span>
                  <span className="text-sm text-gray-500">({collection.documentCount} documents)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Document Operations */}
        <Card className="gcp-card">
          <CardHeader className="gcp-card-header">
            <CardTitle>Document Operations</CardTitle>
          </CardHeader>
          <CardContent className="gcp-card-body">
            <div className="space-y-4">
              <div>
                <Label htmlFor="collectionSelect">Collection</Label>
                <Input
                  id="collectionSelect"
                  value={selectedCollection?.name || ""}
                  placeholder="Select a collection"
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="documentId">Document ID</Label>
                <Input
                  id="documentId"
                  value={documentId}
                  onChange={(e) => setDocumentId(e.target.value)}
                  placeholder="Auto-generate or specify"
                />
              </div>
              <div>
                <Label htmlFor="documentData">Document Data (JSON)</Label>
                <Textarea
                  id="documentData"
                  value={documentData}
                  onChange={(e) => setDocumentData(e.target.value)}
                  rows={8}
                  placeholder={`{
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2023-12-01T10:00:00Z"
}`}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateDocument}
                  disabled={createDocumentMutation.isPending}
                  className="gcp-btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create
                </Button>
                <Button variant="outline">
                  <Search className="h-4 w-4 mr-2" />
                  Read
                </Button>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Update
                </Button>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Query Builder */}
      <Card className="gcp-card">
        <CardHeader className="gcp-card-header">
          <CardTitle>Query Builder</CardTitle>
        </CardHeader>
        <CardContent className="gcp-card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="queryField">Field</Label>
              <Input
                id="queryField"
                value={queryField}
                onChange={(e) => setQueryField(e.target.value)}
                placeholder="email"
              />
            </div>
            <div>
              <Label htmlFor="queryOperator">Operator</Label>
              <Select value={queryOperator} onValueChange={setQueryOperator}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="==">==</SelectItem>
                  <SelectItem value="!=">!=</SelectItem>
                  <SelectItem value=">">&gt;</SelectItem>
                  <SelectItem value=">=">&gt;=</SelectItem>
                  <SelectItem value="<">&lt;</SelectItem>
                  <SelectItem value="<=">&lt;=</SelectItem>
                  <SelectItem value="array-contains">array-contains</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="queryValue">Value</Label>
              <Input
                id="queryValue"
                value={queryValue}
                onChange={(e) => setQueryValue(e.target.value)}
                placeholder="john@example.com"
              />
            </div>
          </div>
          <Button
            onClick={handleExecuteQuery}
            disabled={executeQueryMutation.isPending}
            className="gcp-btn-primary"
          >
            <Play className="h-4 w-4 mr-2" />
            Execute Query
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
