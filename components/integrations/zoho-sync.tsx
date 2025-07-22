"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, CheckCircle, AlertCircle, Users, DollarSign, Calendar } from "lucide-react"

export function ZohoSync() {
  const [issyncing, setIssyncing] = useState(false)
  const [lastSync, setLastSync] = useState("2024-01-15 10:30 AM")
  const [syncStatus] = useState({
    contacts: { total: 128, synced: 128, errors: 0 },
    deals: { total: 45, synced: 43, errors: 2 },
    invoices: { total: 89, synced: 89, errors: 0 },
  })

  const handleSync = async () => {
    setIssyncing(true)
    // Simulate sync process
    setTimeout(() => {
      setIssyncing(false)
      setLastSync(new Date().toLocaleString())
    }, 3000)
  }

  return (
    <div className="space-y-6">
      <Card className="border-[#3B2352]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ fontFamily: "Merriweather, serif" }}>
            <RefreshCw className="h-5 w-5" />
            Zoho Integration Status
          </CardTitle>
          <CardDescription>Sync data between Snugs & Kisses CRM and Zoho services</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Last Sync</div>
              <div className="text-sm text-gray-600">{lastSync}</div>
            </div>
            <Button onClick={handleSync} disabled={issyncing} className="bg-[#3B2352] hover:bg-[#3B2352]/90 text-white">
              {issyncing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync Now
                </>
              )}
            </Button>
          </div>

          {issyncing && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Syncing data...</div>
              <Progress value={65} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Status Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-[#D7C7ED]/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#3B2352]" />
                <span className="font-medium">Contacts</span>
              </div>
              <Badge variant="outline" className="border-green-500 text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Synced
              </Badge>
            </div>
            <div className="text-sm text-gray-600">
              {syncStatus.contacts.synced}/{syncStatus.contacts.total} records
            </div>
            {syncStatus.contacts.errors > 0 && (
              <div className="text-sm text-red-600 mt-1">{syncStatus.contacts.errors} errors</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-[#D7C7ED]/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-[#3B2352]" />
                <span className="font-medium">Deals</span>
              </div>
              <Badge variant="outline" className="border-[#D4AF37] text-[#D4AF37]">
                <AlertCircle className="h-3 w-3 mr-1" />
                Issues
              </Badge>
            </div>
            <div className="text-sm text-gray-600">
              {syncStatus.deals.synced}/{syncStatus.deals.total} records
            </div>
            {syncStatus.deals.errors > 0 && (
              <div className="text-sm text-red-600 mt-1">{syncStatus.deals.errors} errors</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-[#D7C7ED]/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#3B2352]" />
                <span className="font-medium">Invoices</span>
              </div>
              <Badge variant="outline" className="border-green-500 text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Synced
              </Badge>
            </div>
            <div className="text-sm text-gray-600">
              {syncStatus.invoices.synced}/{syncStatus.invoices.total} records
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sync Errors */}
      {syncStatus.deals.errors > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {syncStatus.deals.errors} deals failed to sync. Common issues include missing required fields or duplicate
            records. Check the sync logs for details.
          </AlertDescription>
        </Alert>
      )}

      {/* Integration Settings */}
      <Card className="border-[#3B2352]/20">
        <CardHeader>
          <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Integration Settings</CardTitle>
          <CardDescription>Configure how data syncs between systems</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sync Frequency</label>
              <select className="w-full p-2 border border-[#D7C7ED]/50 rounded-md">
                <option>Every 15 minutes</option>
                <option>Every hour</option>
                <option>Every 4 hours</option>
                <option>Daily</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Conflict Resolution</label>
              <select className="w-full p-2 border border-[#D7C7ED]/50 rounded-md">
                <option>Zoho wins</option>
                <option>CRM wins</option>
                <option>Most recent wins</option>
                <option>Manual review</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input type="checkbox" id="auto-sync" defaultChecked />
            <label htmlFor="auto-sync" className="text-sm">
              Enable automatic sync
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input type="checkbox" id="sync-notifications" defaultChecked />
            <label htmlFor="sync-notifications" className="text-sm">
              Send sync notifications
            </label>
          </div>

          <Button className="bg-[#3B2352] hover:bg-[#3B2352]/90 text-white">Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  )
}
