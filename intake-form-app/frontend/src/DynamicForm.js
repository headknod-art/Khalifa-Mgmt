import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    RadioGroup,
    FormControlLabel,
    Radio,
    Checkbox,
    FormGroup,
    FormControl,
    FormLabel,
    Paper,
    Typography,
    Grid,
    Select,
    MenuItem,
    InputLabel
} from '@mui/material';

const DynamicForm = ({ config, onSubmit }) => {
    const [formData, setFormData] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const fieldValue = type === 'checkbox' ? checked : value;
        setFormData(prev => ({ ...prev, [name]: fieldValue }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit(formData);
    };

    // Validate config
    if (!Array.isArray(config) || config.length === 0) {
        return <Typography color="error">Error: Invalid form configuration</Typography>;
    }

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            {config.map((section, sIdx) => {
                if (!section || typeof section !== 'object') return null;

                const sectionTitle = String(section.sectionTitle || `Section ${sIdx}`).trim();
                const fields = Array.isArray(section.fields) ? section.fields : [];

                return (
                    <Paper elevation={2} sx={{ p: 3, mb: 4 }} key={sectionTitle + sIdx}>
                        <Typography variant="h5" gutterBottom sx={{ mb: 1 }}>
                            {sectionTitle}
                        </Typography>
                        
                        {section.description && (
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                {String(section.description).trim()}
                            </Typography>
                        )}

                        <Grid container spacing={2}>
                            {fields.map((field, fIdx) => {
                                try {
                                    if (!field || typeof field !== 'object') return null;

                                    const fieldName = String(field.name || `field-${fIdx}`).trim();
                                    const fieldLabel = String(field.label || fieldName).trim();
                                    const fieldType = String(field.type || 'text').toLowerCase().trim();
                                    const helperText = field.description ? String(field.description).trim() : '';
                                    const options = Array.isArray(field.options) ? field.options : [];

                                    const value = formData[fieldName] || '';

                                    switch (fieldType) {
                                        case 'text':
                                        case 'number':
                                        case 'tel':
                                        case 'email':
                                        case 'date':
                                            return (
                                                <Grid item xs={12} sm={6} key={fieldName}>
                                                    <TextField
                                                        label={fieldLabel}
                                                        type={fieldType}
                                                        name={fieldName}
                                                        value={value}
                                                        onChange={handleChange}
                                                        fullWidth
                                                        margin="normal"
                                                        helperText={helperText}
                                                        InputLabelProps={fieldType === 'date' ? { shrink: true } : {}}
                                                    />
                                                </Grid>
                                            );

                                        case 'textarea':
                                            return (
                                                <Grid item xs={12} key={fieldName}>
                                                    <TextField
                                                        label={fieldLabel}
                                                        name={fieldName}
                                                        value={value}
                                                        onChange={handleChange}
                                                        fullWidth
                                                        multiline
                                                        rows={4}
                                                        margin="normal"
                                                        helperText={helperText}
                                                    />
                                                </Grid>
                                            );

                                        case 'radio':
                                            return (
                                                <Grid item xs={12} key={fieldName}>
                                                    <FormControl fullWidth margin="normal">
                                                        <FormLabel>{fieldLabel}</FormLabel>
                                                        <RadioGroup
                                                            row
                                                            name={fieldName}
                                                            value={value}
                                                            onChange={handleChange}
                                                        >
                                                            {options.map((opt, oidx) => (
                                                                <FormControlLabel
                                                                    key={`${fieldName}-${oidx}`}
                                                                    value={String(opt.value || '').trim()}
                                                                    control={<Radio />}
                                                                    label={String(opt.label || '').trim()}
                                                                />
                                                            ))}
                                                        </RadioGroup>
                                                        {helperText && <Typography variant="caption" color="textSecondary">{helperText}</Typography>}
                                                    </FormControl>
                                                </Grid>
                                            );

                                        case 'checkbox':
                                            return (
                                                <Grid item xs={12} key={fieldName}>
                                                    <FormControl fullWidth margin="normal">
                                                        <FormLabel>{fieldLabel}</FormLabel>
                                                        <FormGroup row>
                                                            {options.map((opt, oidx) => (
                                                                <FormControlLabel
                                                                    key={`${fieldName}-${oidx}`}
                                                                    control={<Checkbox name={fieldName} />}
                                                                    label={String(opt.label || '').trim()}
                                                                />
                                                            ))}
                                                        </FormGroup>
                                                        {helperText && <Typography variant="caption" color="textSecondary">{helperText}</Typography>}
                                                    </FormControl>
                                                </Grid>
                                            );

                                        case 'select':
                                            return (
                                                <Grid item xs={12} sm={6} key={fieldName}>
                                                    <FormControl fullWidth margin="normal">
                                                        <InputLabel>{fieldLabel}</InputLabel>
                                                        <Select
                                                            name={fieldName}
                                                            value={value}
                                                            label={fieldLabel}
                                                            onChange={handleChange}
                                                        >
                                                            {options.map((opt, oidx) => (
                                                                <MenuItem key={`${fieldName}-${oidx}`} value={String(opt.value || '').trim()}>
                                                                    {String(opt.label || '').trim()}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                            );

                                        default:
                                            return null;
                                    }
                                } catch (e) {
                                    console.error(`Error rendering field at index ${fIdx}:`, e);
                                    return null;
                                }
                            })}
                        </Grid>
                    </Paper>
                );
            })}

            <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
                Submit Intake Form
            </Button>
        </Box>
    );
};

export default DynamicForm;
