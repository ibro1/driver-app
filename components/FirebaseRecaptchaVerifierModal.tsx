
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Modal, StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

interface FirebaseConfig {
    authDomain: string;
    apiKey: string;
    [key: string]: string | undefined;
}

interface Props {
    firebaseConfig: FirebaseConfig;
    title?: string;
    cancelLabel?: string;
}

const FirebaseRecaptchaVerifierModal = forwardRef(({ firebaseConfig, title = "Verification", cancelLabel = "Cancel" }: Props, ref) => {
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [resolvePromise, setResolvePromise] = useState<((token: string) => void) | null>(null);
    const [rejectPromise, setRejectPromise] = useState<((error: Error) => void) | null>(null);

    useImperativeHandle(ref, () => ({
        verify: () => {
            return new Promise((resolve, reject) => {
                setVisible(true);
                setResolvePromise(() => resolve);
                setRejectPromise(() => reject);
            });
        },
        type: 'recaptcha',
        // Internal Firebase method called to reset widget
        _reset: () => {
            setVisible(false);
            setLoading(true);
        }
    }));

    const handleCancel = () => {
        setVisible(false);
        if (rejectPromise) {
            rejectPromise(new Error('Recaptcha cancelled'));
        }
    };

    // We load a simple HTML page from the allowed auth domain.
    // This requires the domain to be capable of serving this (or ignoring 404s and running JS).
    // A better approach for strictly client-side: Use a Data URI but set baseUrl to the auth domain.

    // Minimal HTML for invisible or visible reCAPTCHA
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
        <script src="https://www.google.com/recaptcha/api.js"></script>
        <style>
          body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #fff; }
        </style>
      </head>
      <body>
        <div id="recaptcha-container"></div>
        <script>
          window.onload = function() {
             // Use standard reCAPTCHA
             grecaptcha.render('recaptcha-container', {
               'sitekey': '${process.env.EXPO_PUBLIC_RECAPTCHA_SITE_KEY}', 
               'callback': function(response) {
                  window.ReactNativeWebView.postMessage(response);
               },
               'expired-callback': function() {
                  window.ReactNativeWebView.postMessage('expired');
               }
             });
          }
        </script>
      </body>
    </html>
    `;

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>{title}</Text>
                    <TouchableOpacity onPress={handleCancel}>
                        <Text style={styles.cancel}>{cancelLabel}</Text>
                    </TouchableOpacity>
                </View>
                <WebView
                    source={{
                        html: html,
                        baseUrl: `https://${firebaseConfig.authDomain}`
                    }}
                    style={{ flex: 1 }}
                    javaScriptEnabled
                    domStorageEnabled
                    onMessage={(event) => {
                        const token = event.nativeEvent.data;
                        if (resolvePromise && token) {
                            resolvePromise(token);
                            setVisible(false);
                            setResolvePromise(null);
                        }
                    }}
                    onLoadEnd={() => setLoading(false)}
                />
                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#0000ff" />
                    </View>
                )}
            </View>
        </Modal>
    );
});

export default FirebaseRecaptchaVerifierModal;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingTop: 50, borderBottomWidth: 1, borderColor: '#eee', backgroundColor: '#f8f8f8' },
    title: { fontWeight: 'bold', fontSize: 18 },
    cancel: { color: 'blue', fontSize: 16 },
    loadingOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.8)' }
});
