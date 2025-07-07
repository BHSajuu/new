import { Send, X, Languages, Globe } from "lucide-react";
import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { useTranslationStore } from "../store/useTranslationStore"; // Added translation store
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false },
  {
    id: 2,
    content: "I'm doing great! Just working on some new features.",
    isSent: true,
  },
];

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();
  const navigate = useNavigate();
  
  // Translation store
  const {
    translationEnabled,
    preferredLanguage,
    dailyTranslationCount,
    remainingTranslations,
    availableLanguages,
    getTranslationStats,
    toggleTranslation,
    setPreferredLanguage
  } = useTranslationStore();

  // Fetch translation stats when component mounts
  useEffect(() => {
    getTranslationStats();
  }, [getTranslationStats]);

  return (
    <div className="min-h-screen container mx-auto px-4 pt-20 max-w-5xl hover:shadow-2xl hover:shadow-blue-300/30 transition-all duration-300">
      <div className="space-y-8 ">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm text-base-content/70">
              Customize your chat experience
            </p>
          </div>
          <button 
            onClick={() => navigate("/")} 
            className="transition-transform duration-200 hover:scale-120"
          >
            <X />
          </button>
        </div>

        {/* Translation Settings Section */}
        <div className="bg-base-100 rounded-xl p-6 shadow-lg">
          <div className="flex flex-col gap-1 mb-6">
            <div className="flex items-center gap-2">
              <Languages className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Translation Settings</h2>
            </div>
            <p className="text-sm text-base-content/70">
              Auto-translate messages between different languages
            </p>
          </div>

          <div className="space-y-6">
            {/* Translation Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-medium">Enable Auto-Translation</span>
                <span className="text-sm text-base-content/70">
                  Automatically translate incoming and outgoing messages
                </span>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={translationEnabled}
                onChange={toggleTranslation}
              />
            </div>

            {/* Language Selection */}
            <div className="flex flex-col gap-3">
              <label className="font-medium flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Preferred Language
              </label>
              <select
                className="select select-bordered w-full max-w-xs"
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                disabled={!translationEnabled}
              >
                {availableLanguages.map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
              <p className="text-sm text-base-content/70">
                Messages will be translated to this language
              </p>
            </div>

            {/* Usage Stats */}
            <div className="bg-base-200 rounded-lg p-4">
              <h3 className="font-medium mb-3">Daily Usage</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Translations used today:</span>
                  <span className="text-sm font-medium">{dailyTranslationCount}/15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Remaining translations:</span>
                  <span className="text-sm font-medium text-primary">{remainingTranslations}</span>
                </div>
                <div className="w-full bg-base-300 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(dailyTranslationCount / 15) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-base-content/60 mt-2">
                  Translation limit resets daily at midnight
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Settings Section */}
        <div className="bg-base-100 rounded-xl p-6 shadow-lg">
          <div className="flex flex-col gap-1 mb-6">
            <h2 className="text-lg font-semibold">Theme</h2>
            <p className="text-sm text-base-content/70">
              Choose a theme for your chat interface
            </p>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {THEMES.map((t) => (
              <button
                key={t}
                className={`
                  group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors
                  ${theme === t ? "bg-base-200" : "hover:bg-base-200/50"}
                `}
                onClick={() => setTheme(t)}
              >
                <div
                  className="relative h-8 w-full rounded-md overflow-hidden"
                  data-theme={t}
                >
                  <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                    <div className="rounded bg-primary"></div>
                    <div className="rounded bg-secondary"></div>
                    <div className="rounded bg-accent"></div>
                    <div className="rounded bg-neutral"></div>
                  </div>
                </div>
                <span className="text-[11px] font-medium truncate w-full text-center">
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-base-100 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-3">Preview</h3>
          <div className="rounded-xl border border-base-300 overflow-hidden bg-base-100 shadow-lg">
            <div className="p-4 bg-base-200">
              <div className="max-w-lg mx-auto">
                {/* Mock Chat UI */}
                <div className="bg-base-100 rounded-xl shadow-sm overflow-hidden">
                  {/* Chat Header */}
                  <div className="px-4 py-3 border-b border-base-300 bg-base-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-content font-medium">
                        J
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">John Doe</h3>
                        <p className="text-xs text-base-content/70">Online</p>
                      </div>
                      {translationEnabled && (
                        <div className="ml-auto">
                          <Languages className="w-4 h-4 text-primary" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="p-4 space-y-4 min-h-[200px] max-h-[200px] overflow-y-auto bg-base-100">
                    {PREVIEW_MESSAGES.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.isSent ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`
                            max-w-[80%] rounded-xl p-3 shadow-sm
                            ${
                              message.isSent
                                ? "bg-primary text-primary-content"
                                : "bg-base-200"
                            }
                          `}
                        >
                          <p className="text-sm">{message.content}</p>
                          {translationEnabled && !message.isSent && (
                            <div className="text-xs opacity-60 mt-1 flex items-center gap-1">
                              <Languages className="w-3 h-3" />
                              <span>Translated to {preferredLanguage}</span>
                            </div>
                          )}
                          <p
                            className={`
                              text-[10px] mt-1.5
                              ${
                                message.isSent
                                  ? "text-primary-content/70"
                                  : "text-base-content/70"
                              }
                            `}
                          >
                            12:00 PM
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 border-t border-base-300 bg-base-100">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="input input-bordered flex-1 text-sm h-10"
                        placeholder={translationEnabled ? `Type in any language (will be translated to ${preferredLanguage})...` : "Type a message..."}
                        value="This is a preview"
                        readOnly
                      />
                      <button className="btn btn-primary h-10 min-h-0">
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;