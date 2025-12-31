import React, { useState, Suspense } from 'react';
import { Container, Typography, Box, Alert, CircularProgress } from '@mui/material';
import DynamicForm from './DynamicForm';
import formConfig from './formConfig';

// Error Boundary Component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Container maxWidth="lg">
                    <Box sx={{ my: 4 }}>
                        <Alert severity="error">
                            <Typography variant="h6">Error loading form</Typography>
                            <Typography variant="body2">{this.state.error?.message}</Typography>
                            <Typography variant="caption" sx={{ mt: 1, display: 'block', whiteSpace: 'pre-wrap' }}>
                                {this.state.error?.stack}
                            </Typography>
                        </Alert>
                    </Box>
                </Container>
            );
        }

        return this.props.children;
    }
}

function App() {
    const [submissionStatus, setSubmissionStatus] = useState(null);
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

    const handleSubmit = async (formData) => {
        try {
            console.log('Submitting form data:', formData);
            const response = await fetch(`${API_URL}/api/intake`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ formData }),
            });

            console.log('Response status:', response.status);
            
            const responseText = await response.text();
            console.log('Response text:', responseText);
            
            let responseData = {};
            if (responseText) {
                try {
                    responseData = JSON.parse(responseText);
                } catch (e) {
                    console.error('Failed to parse JSON:', e);
                }
            }

            if (response.ok) {
                setSubmissionStatus({ type: 'success', message: 'Form submitted successfully!' });
                // Scroll to top to see success message
                window.scrollTo(0, 0);
            } else {
                setSubmissionStatus({ type: 'error', message: `Form submission failed: ${responseData.message || response.status}` });
            }
        } catch (error) {
            console.error('Submission error:', error);
            setSubmissionStatus({ type: 'error', message: `Error: ${error.message}` });
        }
    };

    return (
        <ErrorBoundary>
            <Container maxWidth="lg">
                <Box sx={{ my: 4 }}>
                    <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 1 }}>
                        Revocable Living Trust
                    </Typography>
                    <Typography variant="h6" component="p" gutterBottom align="center" sx={{ mb: 3, color: 'gray' }}>
                        Intake Sheet
                    </Typography>
                    
                    {submissionStatus && (
                        <Alert severity={submissionStatus.type} sx={{ mb: 2 }} onClose={() => setSubmissionStatus(null)}>
                            {submissionStatus.message}
                        </Alert>
                    )}
                    
                    <ErrorBoundary>
                        <DynamicForm 
                            config={formConfig} 
                            onSubmit={handleSubmit}
                        />
                    </ErrorBoundary>
                </Box>
            </Container>
        </ErrorBoundary>
    );
}

export default App;