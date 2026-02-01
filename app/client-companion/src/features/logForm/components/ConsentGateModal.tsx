import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import type { GestureResponderEvent } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import ValidationBanner from "../../../shared/components/ValidationBanner";
import {
  CONSENT_REQUIRED_ERROR,
  clearConsentError,
  grantConsent,
  revokeConsent,
  selectConsentError,
  selectConsentGranted,
  setConsentError,
} from "../state/logFormSlice";

type ConsentGateModalProps = {
  visible?: boolean;
};

const ConsentGateModal: React.FC<ConsentGateModalProps> = ({ visible }) => {
  const dispatch = useDispatch();
  const consentGranted = useSelector(selectConsentGranted);
  const consentError = useSelector(selectConsentError);
  const isVisible = !consentGranted || visible === true;

  const handleGrant = (event?: GestureResponderEvent) => {
    if (event) event.preventDefault();
    dispatch(grantConsent());
    dispatch(clearConsentError());
  };

  const handleDecline = (event?: GestureResponderEvent) => {
    if (event) event.preventDefault();
    dispatch(revokeConsent());
    dispatch(setConsentError(CONSENT_REQUIRED_ERROR));
  };

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Consent Required</Text>
          <Text style={styles.body}>
            You must grant consent before creating or submitting any client log.
          </Text>
          <ValidationBanner
            message={consentError || (!consentGranted ? CONSENT_REQUIRED_ERROR : null)}
          />
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" style={styles.primary} onPress={handleGrant}>
              <Text style={styles.primaryLabel}>I Grant Consent</Text>
            </Pressable>
            <Pressable accessibilityRole="button" style={styles.secondary} onPress={handleDecline}>
              <Text style={styles.secondaryLabel}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 420,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    color: "#333",
    marginBottom: 12,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  primary: {
    backgroundColor: "#0b6efd",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  primaryLabel: {
    color: "#fff",
    fontWeight: "600",
  },
  secondary: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#b0b0b0",
    marginLeft: 12,
  },
  secondaryLabel: {
    color: "#333",
    fontWeight: "600",
  },
});

export default ConsentGateModal;
