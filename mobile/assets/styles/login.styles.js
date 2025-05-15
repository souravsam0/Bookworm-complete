import { StyleSheet } from "react-native";
import COLORS from "../../constants/colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topIllustration: {
    height: "30%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  illustrationImage: {
    width: "80%",
    height: "80%",
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  formContainer: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 56,
  },
  inputIcon: {
    marginHorizontal: 16,
  },
  eyeIcon: {
    padding: 16,
  },
  input: {
    flex: 1,
    height: "100%",
    color: COLORS.textDark,
    fontSize: 16,
  },
  button: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  footertext: {
    color: COLORS.textSecondary,
    marginRight: 4,
  },
  link: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  resendButton: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    padding: 8,
  },
  resendText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default styles;