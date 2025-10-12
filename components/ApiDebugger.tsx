// components/ApiDebugger.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { testApiConnection, testAuthEndpoints } from "@/services/testApi";
import { authApi } from "@/services/authApi";

interface TestResults {
  connectionTest?: any;
  endpointTests?: any;
  sampleLogin?: any;
}

const ApiDebugger: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [loading, setLoading] = useState(false);

  const runConnectionTest = async () => {
    setLoading(true);
    try {
      const result = await testApiConnection();
      setTestResults((prev) => ({
        ...prev,
        connectionTest: result,
      }));
    } catch (error) {
      Alert.alert("Error", "Failed to run connection test");
    } finally {
      setLoading(false);
    }
  };

  const runEndpointTests = async () => {
    setLoading(true);
    try {
      const result = await testAuthEndpoints();
      setTestResults((prev) => ({
        ...prev,
        endpointTests: result,
      }));
    } catch (error) {
      Alert.alert("Error", "Failed to run endpoint tests");
    } finally {
      setLoading(false);
    }
  };

  const testSampleLogin = async () => {
    setLoading(true);
    try {
      const result = await authApi.login({
        email: "customer1@techbox.vn",
        password: "customer123",
      });
      setTestResults((prev) => ({
        ...prev,
        sampleLogin: result,
      }));
    } catch (error: any) {
      setTestResults((prev) => ({
        ...prev,
        sampleLogin: { error: error?.message || "Unknown error" },
      }));
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults(null);
  };

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-4">API Debugger</Text>

      <View className="space-y-4">
        <TouchableOpacity
          onPress={runConnectionTest}
          disabled={loading}
          className="bg-blue-500 p-3 rounded-lg"
        >
          <Text className="text-white text-center font-semibold">
            Test API Connection
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={runEndpointTests}
          disabled={loading}
          className="bg-green-500 p-3 rounded-lg"
        >
          <Text className="text-white text-center font-semibold">
            Test Auth Endpoints
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={testSampleLogin}
          disabled={loading}
          className="bg-purple-500 p-3 rounded-lg"
        >
          <Text className="text-white text-center font-semibold">
            Test Sample Login
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={clearResults}
          className="bg-gray-500 p-3 rounded-lg"
        >
          <Text className="text-white text-center font-semibold">
            Clear Results
          </Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View className="mt-4 p-4 bg-yellow-100 rounded-lg">
          <Text className="text-center">Running tests...</Text>
        </View>
      )}

      {testResults && (
        <View className="mt-6">
          <Text className="text-xl font-semibold mb-2">Test Results:</Text>
          <View className="bg-gray-100 p-4 rounded-lg">
            <Text className="font-mono text-sm">
              {JSON.stringify(testResults, null, 2)}
            </Text>
          </View>
        </View>
      )}

      <View className="mt-6 p-4 bg-blue-50 rounded-lg">
        <Text className="font-semibold mb-2">Environment Info:</Text>
        <Text className="text-sm">
          API Base URL: {process.env.EXPO_PUBLIC_API_BASE_URL || "Not set"}
        </Text>
        <Text className="text-sm">
          Environment: {process.env.EXPO_PUBLIC_ENV || "Not set"}
        </Text>
      </View>
    </ScrollView>
  );
};

export default ApiDebugger;
