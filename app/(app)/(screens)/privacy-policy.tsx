import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const PrivacyPolicy = () => {
  const router = useRouter();

  const SectionHeader = ({ title }: { title: string }) => (
    <Text className="text-lg font-bold text-gray-900 mt-6 mb-3">{title}</Text>
  );

  const SubSection = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <View className="mb-4">
      <Text className="text-base font-semibold text-gray-800 mb-2">
        {title}
      </Text>
      {children}
    </View>
  );

  const Paragraph = ({ children }: { children: React.ReactNode }) => (
    <Text className="text-sm text-gray-600 leading-relaxed mb-3">
      {children}
    </Text>
  );

  const BulletPoint = ({ children }: { children: React.ReactNode }) => (
    <View className="flex-row mb-2">
      <Text className="text-blue-600 mr-2">•</Text>
      <Text className="text-sm text-gray-600 leading-relaxed flex-1">
        {children}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#2563eb" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">
          Privacy Policy
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-4 py-2"
        showsVerticalScrollIndicator={false}
      >
        {/* Introduction */}
        <View className="bg-blue-50 rounded-xl p-4 mb-6 mt-2">
          <View className="flex-row items-center mb-2">
            <Ionicons name="shield-checkmark" size={24} color="#2563eb" />
            <Text className="text-lg font-bold text-blue-800 ml-2">
              Your Privacy Matters
            </Text>
          </View>
          <Text className="text-sm text-blue-700 leading-relaxed">
            At E-Shop, we are committed to protecting your privacy and ensuring
            the security of your personal information. This policy explains how
            we collect, use, and safeguard your data.
          </Text>
        </View>

        {/* Last Updated */}
        <View className="bg-gray-50 rounded-lg p-3 mb-6">
          <Text className="text-xs text-gray-500 text-center">
            Last updated: October 4, 2025
          </Text>
        </View>

        {/* Information We Collect */}
        <SectionHeader title="1. Information We Collect" />

        <SubSection title="Personal Information">
          <Paragraph>
            When you create an account or make a purchase, we collect:
          </Paragraph>
          <BulletPoint>
            Name and contact information (email, phone number)
          </BulletPoint>
          <BulletPoint>Shipping and billing addresses</BulletPoint>
          <BulletPoint>
            Payment information (processed securely by our payment partners)
          </BulletPoint>
          <BulletPoint>Order history and preferences</BulletPoint>
        </SubSection>

        <SubSection title="Usage Information">
          <Paragraph>
            We automatically collect information about how you use our app:
          </Paragraph>
          <BulletPoint>
            Device information (type, operating system, unique identifiers)
          </BulletPoint>
          <BulletPoint>App usage patterns and preferences</BulletPoint>
          <BulletPoint>
            Search queries and browsing history within the app
          </BulletPoint>
          <BulletPoint>Location data (with your permission)</BulletPoint>
        </SubSection>

        {/* How We Use Your Information */}
        <SectionHeader title="2. How We Use Your Information" />

        <Paragraph>
          We use your information to provide and improve our services:
        </Paragraph>
        <BulletPoint>Process orders and manage your account</BulletPoint>
        <BulletPoint>
          Provide customer support and respond to inquiries
        </BulletPoint>
        <BulletPoint>
          Send order confirmations and shipping notifications
        </BulletPoint>
        <BulletPoint>Personalize your shopping experience</BulletPoint>
        <BulletPoint>Recommend products based on your preferences</BulletPoint>
        <BulletPoint>
          Improve our app functionality and user experience
        </BulletPoint>
        <BulletPoint>Prevent fraud and ensure security</BulletPoint>

        {/* Information Sharing */}
        <SectionHeader title="3. Information Sharing" />

        <Paragraph>
          We do not sell your personal information. We may share your
          information with:
        </Paragraph>
        <BulletPoint>
          Service providers who help us operate our business (shipping, payment
          processing)
        </BulletPoint>
        <BulletPoint>
          Business partners for joint promotions (with your consent)
        </BulletPoint>
        <BulletPoint>Legal authorities when required by law</BulletPoint>

        {/* Data Security */}
        <SectionHeader title="4. Data Security" />

        <View className="bg-green-50 rounded-xl p-4 mb-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="lock-closed" size={20} color="#059669" />
            <Text className="text-base font-semibold text-green-800 ml-2">
              Security Measures
            </Text>
          </View>
          <Paragraph>
            We implement industry-standard security measures to protect your
            information:
          </Paragraph>
          <BulletPoint>SSL encryption for data transmission</BulletPoint>
          <BulletPoint>Secure data storage with encryption</BulletPoint>
          <BulletPoint>Regular security audits and updates</BulletPoint>
          <BulletPoint>Limited access to personal information</BulletPoint>
        </View>

        {/* Your Rights */}
        <SectionHeader title="5. Your Rights" />

        <Paragraph>You have the right to:</Paragraph>
        <BulletPoint>Access your personal information</BulletPoint>
        <BulletPoint>Update or correct your information</BulletPoint>
        <BulletPoint>Delete your account and associated data</BulletPoint>
        <BulletPoint>Opt-out of marketing communications</BulletPoint>
        <BulletPoint>Request a copy of your data</BulletPoint>

        {/* Cookies and Tracking */}
        <SectionHeader title="6. Cookies and Tracking" />

        <Paragraph>
          We use cookies and similar technologies to enhance your experience:
        </Paragraph>
        <BulletPoint>Remember your preferences and login status</BulletPoint>
        <BulletPoint>Analyze app usage and performance</BulletPoint>
        <BulletPoint>
          Provide personalized content and advertisements
        </BulletPoint>

        <Paragraph>
          You can manage cookie preferences in your device settings.
        </Paragraph>

        {/* Third-Party Services */}
        <SectionHeader title="7. Third-Party Services" />

        <Paragraph>Our app integrates with third-party services:</Paragraph>
        <BulletPoint>Payment processors (Stripe, PayPal)</BulletPoint>
        <BulletPoint>Analytics providers (Google Analytics)</BulletPoint>
        <BulletPoint>Social media platforms</BulletPoint>
        <BulletPoint>Shipping and logistics partners</BulletPoint>

        <Paragraph>
          These services have their own privacy policies that govern their use
          of your information.
        </Paragraph>

        {/* Children's Privacy */}
        <SectionHeader title="8. Children's Privacy" />

        <Paragraph>
          Our services are not intended for children under 13. We do not
          knowingly collect personal information from children under 13. If you
          believe we have collected such information, please contact us
          immediately.
        </Paragraph>

        {/* Changes to Privacy Policy */}
        <SectionHeader title="9. Changes to This Policy" />

        <Paragraph>
          We may update this privacy policy from time to time. We will notify
          you of any material changes through the app or via email. Your
          continued use of the app after changes constitutes acceptance of the
          updated policy.
        </Paragraph>

        {/* Contact Information */}
        <SectionHeader title="10. Contact Us" />

        <View className="bg-blue-50 rounded-xl p-4 mb-6">
          <Text className="text-base font-semibold text-blue-800 mb-3">
            Questions About Privacy?
          </Text>
          <Paragraph>
            If you have any questions or concerns about this privacy policy or
            our data practices, please contact us:
          </Paragraph>
          <View className="flex-row items-center mb-2">
            <Ionicons name="mail" size={16} color="#2563eb" />
            <Text className="text-sm text-blue-700 ml-2 font-medium">
              privacy@eshop.com
            </Text>
          </View>
          <View className="flex-row items-center mb-2">
            <Ionicons name="call" size={16} color="#2563eb" />
            <Text className="text-sm text-blue-700 ml-2 font-medium">
              +1 (555) 123-4567
            </Text>
          </View>
          <View className="flex-row items-start">
            <Ionicons name="location" size={16} color="#2563eb" />
            <Text className="text-sm text-blue-700 ml-2 font-medium flex-1">
              123 E-Commerce Street, Digital City, DC 12345
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View className="bg-gray-100 rounded-lg p-4 mb-8">
          <Text className="text-xs text-gray-500 text-center leading-relaxed">
            By using E-Shop, you acknowledge that you have read and understood
            this Privacy Policy and agree to the collection and use of your
            information as described herein.
          </Text>
        </View>

        {/* Bottom spacing */}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
};

export default PrivacyPolicy;
