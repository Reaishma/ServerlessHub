import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Filter, RotateCcw } from "lucide-react";

export default function Logging() {
  const [serviceFilter, setServiceFilter] = useState("All Services");
  const [levelFilter, setLevelFilter] = useState("All Levels");
  const [timeRange, setTimeRange] = useState("Last 1 hour");

  const { data: logs = [], refetch } = useQuery({
    queryKey: ["/api/logs", { service: serviceFilter, level: levelFilter, limit: 50 }],
  });

  const handleRefresh = () => {
    refetch();
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case "ERROR":
        return "text-red-400";
      case "WARNING":
        return "text-yellow-400";
      case "INFO":
        return "text-blue-400";
      case "DEBUG":
        return "text-gray-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Cloud Logging</h2>
        <p className="text-gray-600">View and filter application logs</p>
      </div>

      {/* Log Filters */}
      <Card className="gcp-card">
        <CardHeader className="gcp-card-header">
          <CardTitle>Log Filters</CardTitle>
        </CardHeader>
        <CardContent className="gcp-card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="serviceFilter">Service</Label>
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Services">All Services</SelectItem>
                  <SelectItem value="Cloud Functions">Cloud Functions</SelectItem>
                  <SelectItem value="Cloud Endpoints">Cloud Endpoints</SelectItem>
                  <SelectItem value="Cloud Firestore">Cloud Firestore</SelectItem>
                  <SelectItem value="IAM">IAM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="levelFilter">Log Level</Label>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Levels">All Levels</SelectItem>
                  <SelectItem value="ERROR">ERROR</SelectItem>
                  <SelectItem value="WARNING">WARNING</SelectItem>
                  <SelectItem value="INFO">INFO</SelectItem>
                  <SelectItem value="DEBUG">DEBUG</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="timeRange">Time Range</Label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Last 1 hour">Last 1 hour</SelectItem>
                  <SelectItem value="Last 6 hours">Last 6 hours</SelectItem>
                  <SelectItem value="Last 24 hours">Last 24 hours</SelectItem>
                  <SelectItem value="Last 7 days">Last 7 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="gcp-btn-primary mr-2">
            <Filter className="h-4 w-4 mr-2" />
            Apply Filters
          </Button>
        </CardContent>
      </Card>

      {/* Log Entries */}
      <Card className="gcp-card">
        <CardHeader className="gcp-card-header flex flex-row items-center justify-between">
          <CardTitle>Log Entries</CardTitle>
          <Button onClick={handleRefresh} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="gcp-card-body">
          <div className="space-y-2">
            {logs.map((log: any) => (
              <div key={log.id} className="gcp-log-entry">
                <span className="text-gray-500">
                  {new Date(log.timestamp).toLocaleString()}
                </span>{" "}
                <span className={`font-bold ${getLogLevelColor(log.level)}`}>
                  [{log.level}]
                </span>{" "}
                <span className="text-gray-300">{log.service}:</span> {log.message}
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No log entries found for the selected filters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
