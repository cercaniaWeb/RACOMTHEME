// Theme utility for the POS application
// Based on design inspirations and improved visual aesthetics

export const theme = {
  // Color palette with improved aesthetics
  colors: {
    // Primary colors - More vibrant blues
    primary: {
      main: '#3b82f6',      // blue-500
      light: '#60a5fa',     // blue-400 
      dark: '#2563eb',      // blue-600
    },
    // Secondary colors - Warmer grays
    secondary: {
      main: '#6b7280',      // gray-500
      light: '#9ca3af',     // gray-400
      dark: '#4b5563',      // gray-600
    },
    // Accent colors - Modern indigo
    accent: {
      main: '#818cf8',      // indigo-400
      light: '#a5b4fc',     // indigo-300
      dark: '#6366f1',      // indigo-500
    },
    // Success, warning, danger
    success: {
      main: '#10b981',      // emerald-500
      light: '#34d399',     // emerald-400
      dark: '#059669',      // emerald-600
    },
    warning: {
      main: '#f59e0b',      // amber-500
      light: '#fbbf24',     // amber-400
      dark: '#d97706',      // amber-600
    },
    danger: {
      main: '#ef4444',      // red-500
      light: '#f87171',     // red-400
      dark: '#dc2626',      // red-600
    },
    // Background and surface colors
    background: {
      light: '#f0f9ff',     // blue-50 (more vibrant)
      main: '#ffffff',      // white
      dark: '#f9fafb',      // gray-50
    },
    surface: {
      main: '#ffffff',      // white
      light: '#f0f9ff',     // blue-50
      dark: '#f9fafb',      // gray-50
    },
    text: {
      primary: '#111827',   // gray-900 (darker)
      secondary: '#6b7280', // gray-500
      disabled: '#9ca3af',  // gray-400
      inverse: '#ffffff',   // white
    },
    border: {
      light: '#e0e7ff',     // blue-200
      main: '#c7d2fe',      // blue-300
      dark: '#a5b4fc',      // blue-400
    }
  },
  
  // Spacing system
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    xxl: '3rem',      // 48px
  },
  
  // Typography
  typography: {
    fontSize: {
      xs: '0.75rem',   // 12px
      sm: '0.875rem',  // 14px
      base: '1rem',    // 16px
      lg: '1.125rem',  // 18px
      xl: '1.25rem',   // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  
  // Border radius
  borderRadius: {
    sm: '0.5rem',   // 8px
    md: '0.75rem',     // 12px
    lg: '1rem',    // 16px
    xl: '1.5rem',       // 24px
    full: '9999px',   // full
  },
  
  // Shadow
  shadow: {
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -2px rgba(0, 0, 0, 0.1), 0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 25px 30px -10px rgba(0, 0, 0, 0.15)',
  },
  
  // Component-specific styles
  components: {
    button: {
      primary: {
        backgroundColor: 'linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)',
        color: '#ffffff',
        hover: 'linear-gradient(135deg, #2563eb 0%, #4338ca 100%)',
        active: 'linear-gradient(135deg, #1d4ed8 0%, #3730a3 100%)',
      },
      secondary: {
        backgroundColor: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
        color: '#374151',
        hover: 'linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)',
        active: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
      },
      success: {
        backgroundColor: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: '#ffffff',
        hover: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        active: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
      },
      danger: {
        backgroundColor: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        color: '#ffffff',
        hover: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
        active: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
      },
      outline: {
        backgroundColor: 'transparent',
        color: '#3b82f6',
        borderColor: 'border border-blue-500',
        hover: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        active: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
      }
    },
    card: {
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(199, 210, 254, 0.2)',
      borderRadius: '1rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.01)',
    },
    input: {
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      borderColor: '#c7d2fe',
      borderRadius: '0.75rem',
      focus: {
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.2)',
      }
    }
  }
};

// Dark mode theme
export const darkTheme = {
  ...theme,
  colors: {
    // Primary colors
    primary: {
      main: '#60a5fa',      // blue-400
      light: '#93c5fd',     // blue-300 
      dark: '#3b82f6',      // blue-500
    },
    // Secondary colors
    secondary: {
      main: '#9ca3af',      // gray-400
      light: '#d1d5db',     // gray-300
      dark: '#6b7280',      // gray-500
    },
    // Accent colors 
    accent: {
      main: '#a5b4fc',      // indigo-300
      light: '#c7d2fe',     // indigo-200
      dark: '#818cf8',      // indigo-400
    },
    // Success, warning, danger
    success: {
      main: '#34d399',      // emerald-400
      light: '#6ee7b7',     // emerald-300
      dark: '#10b981',      // emerald-500
    },
    warning: {
      main: '#fbbf24',      // amber-400
      light: '#fcd34d',     // amber-300
      dark: '#f59e0b',      // amber-500
    },
    danger: {
      main: '#f87171',      // red-400
      light: '#fca5a5',     // red-300
      dark: '#ef4444',      // red-500
    },
    // Background and surface colors
    background: {
      light: '#0f172a',     // slate-900
      main: '#1e293b',      // slate-800
      dark: '#0f172a',      // slate-900
    },
    surface: {
      main: '#1e293b',      // slate-800
      light: '#334155',     // slate-700
      dark: '#0f172a',      // slate-900
    },
    text: {
      primary: '#f8fafc',   // slate-50
      secondary: '#cbd5e1', // slate-400
      disabled: '#94a3b8',  // slate-500
      inverse: '#0f172a',   // slate-900
    },
    border: {
      light: '#334155',     // slate-700
      main: '#475569',      // slate-600
      dark: '#94a3b8',      // slate-500
    }
  }
};

// Helper function to get the appropriate theme based on dark mode setting
export const getTheme = (darkMode) => {
  return darkMode ? darkTheme : theme;
};