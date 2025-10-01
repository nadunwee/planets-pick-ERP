import { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Building,
  Users,
  Shield,
  Database,
  Bell,
  Save,
  Plus,
  Download,
  CheckCircle,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import ScrollToTop from "@/components/ScrollToTop";

interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  taxId: string;
  currency: string;
  timezone: string;
}

interface SystemPreferences {
  language: string;
  dateFormat: string;
  timeFormat: string;
  theme: "light" | "dark" | "auto";
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expiryDays: number;
  };
  sessionTimeout: number;
  twoFactorAuth: boolean;
  failedLoginAttempts: number;
  lockoutDuration: number;
}

const languages = ["English", "Sinhala", "Tamil"];
const dateFormats = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];
const timeFormats = ["12-hour", "24-hour"];
const currencies = ["LKR", "USD", "EUR", "GBP"];
const timezones = ["Asia/Colombo", "UTC", "America/New_York", "Europe/London"];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("company");
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const { theme, setTheme } = useTheme();

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: "Planet's Pick ERP",
    address: "123 Coconut Grove, Colombo 03, Sri Lanka",
    phone: "+94 11 234 5678",
    email: "info@planetspick.com",
    website: "https://planetspick.com",
    taxId: "LK123456789",
    currency: "LKR",
    timezone: "Asia/Colombo",
  });

  const [systemPreferences, setSystemPreferences] = useState<SystemPreferences>({
    language: "English",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24-hour",
    theme: theme,
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
  });

  // Sync theme from context to local state
  useEffect(() => {
    setSystemPreferences(prev => ({ ...prev, theme }));
  }, [theme]);

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      expiryDays: 90,
    },
    sessionTimeout: 30,
    twoFactorAuth: false,
    failedLoginAttempts: 5,
    lockoutDuration: 15,
  });

  const handleSave = (section: string) => {
    console.log(`Saving ${section} settings...`);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const tabs = [
    { id: "company", name: "Company Info", icon: Building },
    { id: "system", name: "System Preferences", icon: SettingsIcon },
    { id: "security", name: "Security", icon: Shield },
    { id: "backup", name: "Backup & Restore", icon: Database },
    { id: "users", name: "User Management", icon: Users },
    { id: "notifications", name: "Notifications", icon: Bell },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            System Settings
          </h1>
          <p className="text-gray-600">
            Configure system preferences, security, and company information
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleSave("all")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <Save size={16} />
            Save All Changes
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition">
            <Download size={16} />
            Export Settings
          </button>
        </div>
      </div>

      {/* Success Message */}
      {showSaveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="text-green-600" size={20} />
          <span className="text-green-800 font-medium">Settings saved successfully!</span>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon size={16} />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Company Information Tab */}
          {activeTab === "company" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Building className="text-blue-600" size={24} />
                <h2 className="text-xl font-semibold">Company Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={companyInfo.name}
                    onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax ID
                  </label>
                  <input
                    type="text"
                    value={companyInfo.taxId}
                    onChange={(e) => setCompanyInfo({...companyInfo, taxId: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={companyInfo.email}
                    onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={companyInfo.phone}
                    onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={companyInfo.website}
                    onChange={(e) => setCompanyInfo({...companyInfo, website: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={companyInfo.currency}
                    onChange={(e) => setCompanyInfo({...companyInfo, currency: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    {currencies.map((currency) => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    value={companyInfo.timezone}
                    onChange={(e) => setCompanyInfo({...companyInfo, timezone: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    {timezones.map((timezone) => (
                      <option key={timezone} value={timezone}>{timezone}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={companyInfo.address}
                    onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleSave("company")}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Save size={16} />
                  Save Company Info
                </button>
              </div>
            </div>
          )}

          {/* System Preferences Tab */}
          {activeTab === "system" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <SettingsIcon className="text-blue-600" size={24} />
                <h2 className="text-xl font-semibold">System Preferences</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={systemPreferences.language}
                    onChange={(e) => setSystemPreferences({...systemPreferences, language: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    {languages.map((language) => (
                      <option key={language} value={language}>{language}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme
                  </label>
                  <select
                    value={systemPreferences.theme}
                    onChange={(e) => {
                      const newTheme = e.target.value as "light" | "dark" | "auto";
                      setSystemPreferences({...systemPreferences, theme: newTheme});
                      setTheme(newTheme); // Update global theme context
                    }}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Format
                  </label>
                  <select
                    value={systemPreferences.dateFormat}
                    onChange={(e) => setSystemPreferences({...systemPreferences, dateFormat: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    {dateFormats.map((format) => (
                      <option key={format} value={format}>{format}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Format
                  </label>
                  <select
                    value={systemPreferences.timeFormat}
                    onChange={(e) => setSystemPreferences({...systemPreferences, timeFormat: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    {timeFormats.map((format) => (
                      <option key={format} value={format}>{format}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Notifications
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={systemPreferences.notifications.email}
                        onChange={(e) => setSystemPreferences({
                          ...systemPreferences,
                          notifications: {...systemPreferences.notifications, email: e.target.checked}
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Email Notifications</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={systemPreferences.notifications.push}
                        onChange={(e) => setSystemPreferences({
                          ...systemPreferences,
                          notifications: {...systemPreferences.notifications, push: e.target.checked}
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Push Notifications</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={systemPreferences.notifications.sms}
                        onChange={(e) => setSystemPreferences({
                          ...systemPreferences,
                          notifications: {...systemPreferences.notifications, sms: e.target.checked}
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">SMS Notifications</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleSave("system")}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Save size={16} />
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* Security Settings Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Shield className="text-blue-600" size={24} />
                <h2 className="text-xl font-semibold">Security Settings</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Password Length
                  </label>
                  <input
                    type="number"
                    min="6"
                    max="20"
                    value={securitySettings.passwordPolicy.minLength}
                    onChange={(e) => setSecuritySettings({
                      ...securitySettings,
                      passwordPolicy: {...securitySettings.passwordPolicy, minLength: parseInt(e.target.value)}
                    })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="480"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Failed Login Attempts
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="10"
                    value={securitySettings.failedLoginAttempts}
                    onChange={(e) => setSecuritySettings({...securitySettings, failedLoginAttempts: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lockout Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={securitySettings.lockoutDuration}
                    onChange={(e) => setSecuritySettings({...securitySettings, lockoutDuration: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Password Requirements
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={securitySettings.passwordPolicy.requireUppercase}
                        onChange={(e) => setSecuritySettings({
                          ...securitySettings,
                          passwordPolicy: {...securitySettings.passwordPolicy, requireUppercase: e.target.checked}
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Require Uppercase Letters</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={securitySettings.passwordPolicy.requireLowercase}
                        onChange={(e) => setSecuritySettings({
                          ...securitySettings,
                          passwordPolicy: {...securitySettings.passwordPolicy, requireLowercase: e.target.checked}
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Require Lowercase Letters</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={securitySettings.passwordPolicy.requireNumbers}
                        onChange={(e) => setSecuritySettings({
                          ...securitySettings,
                          passwordPolicy: {...securitySettings.passwordPolicy, requireNumbers: e.target.checked}
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Require Numbers</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={securitySettings.passwordPolicy.requireSpecialChars}
                        onChange={(e) => setSecuritySettings({
                          ...securitySettings,
                          passwordPolicy: {...securitySettings.passwordPolicy, requireSpecialChars: e.target.checked}
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Require Special Characters</span>
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Two-Factor Authentication
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={securitySettings.twoFactorAuth}
                      onChange={(e) => setSecuritySettings({...securitySettings, twoFactorAuth: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Enable Two-Factor Authentication</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleSave("security")}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Save size={16} />
                  Save Security Settings
                </button>
              </div>
            </div>
          )}

          {/* Other tabs with placeholder content */}
          {activeTab === "backup" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Database className="text-blue-600" size={24} />
                <h2 className="text-xl font-semibold">Backup & Restore</h2>
              </div>
              <div className="text-center text-gray-500 py-12">
                <Database size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Backup and restore functionality will be implemented here</p>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="text-blue-600" size={24} />
                  <h2 className="text-xl font-semibold">User Management</h2>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                  <Plus size={16} />
                  Add User
                </button>
              </div>
              <div className="text-center text-gray-500 py-12">
                <Users size={48} className="mx-auto mb-4 text-gray-300" />
                <p>User management interface will be implemented here</p>
                <p className="text-sm mt-2">This will integrate with the Administrator dashboard</p>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Bell className="text-blue-600" size={24} />
                <h2 className="text-xl font-semibold">Notification Settings</h2>
              </div>
              <div className="text-center text-gray-500 py-12">
                <Bell size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Advanced notification settings will be implemented here</p>
                <p className="text-sm mt-2">Configure email templates, SMS settings, and push notifications</p>
              </div>
            </div>
          )}
        </div>
      </div>
    <ScrollToTop />
    </div>
  );
}
