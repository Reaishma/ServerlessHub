import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Overview() {
  const { data: functions = [] } = useQuery({
    queryKey: ["/api/functions"],
  });

  const { data: endpoints = [] } = useQuery({
    queryKey: ["/api/endpoints"],
  });

  const { data: logs = [] } = useQuery({
    queryKey: ["/api/logs", { limit: 5 }],
  });

  const recentActivities = logs.slice(0, 5).map(log => ({
    service: log.service,
    action: log.message,
    status: log.level === "ERROR" ? "error" : "success",
    time: new Date(log.timestamp).toLocaleTimeString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Platform Overview</h2>
        <p className="text-gray-600">Monitor your serverless platform resources and performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="gcp-stats-card">
          <div className="gcp-stats-number">{functions.length}</div>
          <div className="gcp-stats-label">Active Functions</div>
        </div>
        <div className="gcp-stats-card">
          <div className="gcp-stats-number">{endpoints.length}</div>
          <div className="gcp-stats-label">API Endpoints</div>
        </div>
        <div className="gcp-stats-card">
          <div className="gcp-stats-number">2.4k</div>
          <div className="gcp-stats-label">Database Operations</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="gcp-card">
          <CardHeader className="gcp-card-header">
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="gcp-card-body">
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{activity.service}</div>
                    <div className="text-sm text-gray-600">{activity.action}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={activity.status === "success" ? "gcp-status-success" : "gcp-status-error"}>
                      {activity.status === "success" ? "Success" : "Error"}
                    </Badge>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card className="gcp-card">
          <CardHeader className="gcp-card-header">
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent className="gcp-card-body">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>CPU Usage</span>
                  <span>42%</span>
                </div>
                <div className="gcp-progress-bar">
                  <div className="gcp-progress-fill" style={{ width: "42%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Memory Usage</span>
                  <span>68%</span>
                </div>
                <div className="gcp-progress-bar">
                  <div className="gcp-progress-fill bg-yellow-500" style={{ width: "68%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Storage Usage</span>
                  <span>24%</span>
                </div>
                <div className="gcp-progress-bar">
                  <div className="gcp-progress-fill bg-green-500" style={{ width: "24%" }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
              }
