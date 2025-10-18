import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircleIcon } from 'lucide-react';

interface AlertErrorProps {
    errors?: string[] | Record<string, string>;
    title?: string;
}

export function AlertError({ errors, title }: AlertErrorProps) {
    if (!errors) return null;

    // Handle both array and object formats
    const errorMessages: string[] = [];
    
    if (Array.isArray(errors)) {
        errorMessages.push(...errors);
    } else if (typeof errors === 'object') {
        errorMessages.push(...Object.values(errors));
    }

    if (errorMessages.length === 0) return null;

    return (
        <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>{title || 'Something went wrong.'}</AlertTitle>
            <AlertDescription>
                <ul className="list-inside list-disc text-sm">
                    {Array.from(new Set(errorMessages)).map((error, index) => (
                        <li key={index}>{error}</li>
                    ))}
                </ul>
            </AlertDescription>
        </Alert>
    );
}

// Keep the default export for backward compatibility
export default AlertError;
