import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { Component } from 'react'
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

const COLORS = {
  background: '#FAFAFA',
  card: '#FFFFFF',
  primary: '#FF5722',
  text: '#1A1A1A',
  secondary: '#666666',
  error: '#F44336',
  border: '#F0F0F0',
}

/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the component tree,
 * logs those errors, and displays a fallback UI instead of crashing the app.
 * 
 * Usage:
 * ```jsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service (e.g., Sentry, LogRocket)
    console.error('🔥 Error caught by boundary:', error)
    console.error('🔥 Error info:', errorInfo)

    // You can send this to an error reporting service
    // Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } })

    // Save error to local file for debugging
    this.saveErrorToLog(error, errorInfo)

    this.setState({ errorInfo })
  }

  async saveErrorToLog(error, errorInfo) {
    try {
      const errorLog = {
        timestamp: new Date().toISOString(),
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
        componentStack: errorInfo.componentStack,
        platform: 'react-native',
      }

      const logContent = JSON.stringify(errorLog, null, 2)
      const logDir = FileSystem.documentDirectory || ''
      const logFile = `${logDir}error-log-${Date.now()}.json`

      await FileSystem.writeAsStringAsync(logFile, logContent, {
        encoding: FileSystem.EncodingType.UTF8,
      })

      console.log('🔥 Error saved to:', logFile)
    } catch (saveError) {
      console.error('🔥 Failed to save error log:', saveError)
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  async handleReportError() {
    if (!this.state.error) return

    try {
      const reportContent = this.generateErrorReport()
      const reportDir = FileSystem.documentDirectory || ''
      const reportFile = `${reportDir}error-report-${Date.now()}.txt`

      await FileSystem.writeAsStringAsync(reportFile, reportContent, {
        encoding: FileSystem.EncodingType.UTF8,
      })

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(reportFile, {
          mimeType: 'text/plain',
          dialogTitle: 'Share Error Report',
        })
      }
    } catch (error) {
      console.error('🔥 Failed to generate error report:', error)
    }
  }

  generateErrorReport() {
    const { error, errorInfo } = this.state
    const report = [
      '===== SLOW BURN APP - ERROR REPORT =====',
      `Timestamp: ${new Date().toISOString()}`,
      `Platform: React Native`,
      '',
      '----- ERROR DETAILS -----',
      `Name: ${error?.name || 'Unknown'}`,
      `Message: ${error?.message || 'Unknown error'}`,
      '',
      '----- STACK TRACE -----',
      error?.stack || 'No stack trace available',
      '',
      '----- COMPONENT STACK -----',
      errorInfo?.componentStack || 'No component stack available',
      '',
      '===== END OF REPORT =====',
    ].join('\n')

    return report
  }

  render() {
    if (this.state.hasError) {
      // You can render a custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.icon}>🔥</Text>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.subtitle}>
              Don't worry, we've logged the error. You can try again or report the issue.
            </Text>

            {this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorLabel}>Error:</Text>
                <Text style={styles.errorMessage} numberOfLines={3}>
                  {this.state.error.message}
                </Text>
              </View>
            )}

            <View style={styles.buttonRow}>
              <Pressable
                onPress={this.handleRetry}
                style={styles.retryButton}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </Pressable>

              <Pressable
                onPress={() => this.handleReportError()}
                style={styles.reportButton}
              >
                <Text style={styles.reportButtonText}>Report Error</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      )
    }

    return this.props.children
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  errorDetails: {
    backgroundColor: '#FFF5F5',
    borderColor: COLORS.error,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 24,
  },
  errorLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.error,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  errorMessage: {
    fontSize: 14,
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  retryButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  reportButton: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reportButtonText: {
    color: COLORS.secondary,
    fontSize: 16,
    fontWeight: '700',
  },
})

export default ErrorBoundary