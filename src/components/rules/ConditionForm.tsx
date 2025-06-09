import { RuleCondition } from '@/types/models';
import { Trash2, Info } from 'lucide-react';

interface ConditionFormProps {
    condition: RuleCondition;
    onChange: (condition: RuleCondition) => void;
}

export function ConditionForm({ condition, onChange }: ConditionFormProps) {
    const handleChange = (field: keyof RuleCondition | string, value: any) => {
        if (field.includes('.')) {
            // Handle nested configuration fields
            const [parent, child] = field.split('.');
            onChange({
                ...condition,
                [parent]: {
                    ...condition[parent as keyof RuleCondition],
                    [child]: value
                }
            });
        } else {
            onChange({
                ...condition,
                [field]: value
            });
        }
    };

    const getOperatorOptions = () => {
        switch (condition.type) {
            case 'NUMERIC_COMPARISON':
                return [
                    { value: 'EQUALS', label: 'Equals' },
                    { value: 'NOT_EQUALS', label: 'Not Equals' },
                    { value: 'GREATER_THAN', label: 'Greater Than' },
                    { value: 'LESS_THAN', label: 'Less Than' },
                    { value: 'GREATER_THAN_OR_EQUAL', label: 'Greater Than or Equal' },
                    { value: 'LESS_THAN_OR_EQUAL', label: 'Less Than or Equal' }
                ];
            case 'STRING_MATCH':
                return [
                    { value: 'EQUALS', label: 'Equals' },
                    { value: 'NOT_EQUALS', label: 'Not Equals' },
                    { value: 'CONTAINS', label: 'Contains' },
                    { value: 'NOT_CONTAINS', label: 'Not Contains' },
                    { value: 'STARTS_WITH', label: 'Starts With' },
                    { value: 'ENDS_WITH', label: 'Ends With' },
                    { value: 'MATCHES_PATTERN', label: 'Matches Pattern' }
                ];
            case 'DATE_COMPARISON':
                return [
                    { value: 'BEFORE', label: 'Before' },
                    { value: 'AFTER', label: 'After' },
                    { value: 'ON', label: 'On' },
                    { value: 'WITHIN_DAYS', label: 'Within Days' }
                ];
            default:
                return [
                    { value: 'EQUALS', label: 'Equals' },
                    { value: 'NOT_EQUALS', label: 'Not Equals' }
                ];
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Type*
                        <Info className="inline h-3 w-3 ml-1 text-gray-400" />
                    </label>
                    <select
                        value={condition.type}
                        onChange={(e) => handleChange('type', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                        <option value="EXACT_MATCH">Exact Match</option>
                        <option value="STRING_MATCH">String Match</option>
                        <option value="NUMERIC_COMPARISON">Numeric Comparison</option>
                        <option value="FUZZY_MATCH">Fuzzy Match</option>
                        <option value="BOOKING_MATCH">Booking Match</option>
                        <option value="STATUS_CHECK">Status Check</option>
                        <option value="DATE_COMPARISON">Date Comparison</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Operator*
                    </label>
                    <select
                        value={condition.operator}
                        onChange={(e) => handleChange('operator', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                        {getOperatorOptions().map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Invoice Field*
                    </label>
                    <input
                        type="text"
                        value={condition.invoiceField}
                        onChange={(e) => handleChange('invoiceField', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="e.g., booking_reference"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        OMS Field*
                    </label>
                    <input
                        type="text"
                        value={condition.omsField}
                        onChange={(e) => handleChange('omsField', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="e.g., confirmation_number"
                    />
                </div>
            </div>

            {/* Type-specific configurations */}
            {condition.type === 'NUMERIC_COMPARISON' && (
                <div className="border-t pt-4 space-y-4">
                    <h5 className="text-sm font-medium text-gray-700">Tolerance Configuration</h5>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600">
                                Percentage Tolerance
                            </label>
                            <input
                                type="number"
                                value={condition.configuration?.tolerance?.percentage || ''}
                                onChange={(e) => handleChange('configuration.tolerance.percentage', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">
                                Absolute Value Tolerance
                            </label>
                            <input
                                type="number"
                                value={condition.configuration?.tolerance?.absoluteValue || ''}
                                onChange={(e) => handleChange('configuration.tolerance.absoluteValue', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">
                                Currency
                            </label>
                            <select
                                value={condition.configuration?.tolerance?.currency || 'USD'}
                                onChange={(e) => handleChange('configuration.tolerance.currency', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                                <option value="JPY">JPY</option>
                                <option value="CNY">CNY</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">
                                Mode
                            </label>
                            <select
                                value={condition.configuration?.tolerance?.mode || 'HIGHER_OF'}
                                onChange={(e) => handleChange('configuration.tolerance.mode', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                                <option value="HIGHER_OF">Higher Of</option>
                                <option value="LOWER_OF">Lower Of</option>
                                <option value="PERCENTAGE_ONLY">Percentage Only</option>
                                <option value="ABSOLUTE_ONLY">Absolute Only</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {condition.type === 'STRING_MATCH' && condition.operator === 'MATCHES_PATTERN' && (
                <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700">
                        Pattern*
                    </label>
                    <input
                        type="text"
                        value={condition.configuration?.pattern || ''}
                        onChange={(e) => handleChange('configuration.pattern', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="e.g., ^[A-Z]+[0-9]+$"
                    />
                </div>
            )}

            {condition.type === 'STRING_MATCH' && condition.operator === 'CONTAINS' && (
                <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700">
                        Substring*
                    </label>
                    <input
                        type="text"
                        value={condition.configuration?.substring || ''}
                        onChange={(e) => handleChange('configuration.substring', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Text to search for"
                    />
                </div>
            )}

            {condition.type === 'FUZZY_MATCH' && (
                <div className="border-t pt-4 space-y-4">
                    <h5 className="text-sm font-medium text-gray-700">Fuzzy Match Configuration</h5>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">Algorithms</label>
                        <div className="space-y-2">
                            {['Levenshtein', 'Soundex', 'Abbreviations', 'Others'].map(algo => (
                                <label key={algo} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        checked={condition.configuration?.algorithms?.includes(algo) || false}
                                        onChange={(e) => {
                                            const current = condition.configuration?.algorithms || [];
                                            const updated = e.target.checked
                                                ? [...current, algo]
                                                : current.filter(a => a !== algo);
                                            handleChange('configuration.algorithms', updated);
                                        }}
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{algo}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600">
                            Threshold (0-100)
                        </label>
                        <input
                            type="range"
                            value={condition.configuration?.threshold || 80}
                            onChange={(e) => handleChange('configuration.threshold', parseInt(e.target.value))}
                            className="mt-1 block w-full"
                            min="0"
                            max="100"
                        />
                        <div className="text-center text-sm text-gray-600">
                            {condition.configuration?.threshold || 80}%
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                            Abbreviation Mappings
                        </label>
                        {(condition.configuration?.abbreviationMappings || []).map((mapping: any, index: number) => (
                            <div key={index} className="flex items-center gap-2 mb-2">
                                <input
                                    type="text"
                                    value={mapping.from || ''}
                                    onChange={(e) => {
                                        const mappings = [...(condition.configuration?.abbreviationMappings || [])];
                                        mappings[index] = { ...mappings[index], from: e.target.value };
                                        handleChange('configuration.abbreviationMappings', mappings);
                                    }}
                                    className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="From"
                                />
                                <input
                                    type="text"
                                    value={mapping.to || ''}
                                    onChange={(e) => {
                                        const mappings = [...(condition.configuration?.abbreviationMappings || [])];
                                        mappings[index] = {
                                            ...mappings[index],
                                            to: e.target.value
                                        };
                                        handleChange('configuration.abbreviationMappings', mappings);
                                    }}
                                    className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="To"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const mappings = condition.configuration?.abbreviationMappings || [];
                                        handleChange('configuration.abbreviationMappings', mappings.filter((_, i) => i !== index));
                                    }}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => {
                                const mappings = condition.configuration?.abbreviationMappings || [];
                                handleChange('configuration.abbreviationMappings', [...mappings, { fullName: '', abbreviations: [] }]);
                            }}
                            className="text-sm text-blue-600 hover:text-blue-700"
                        >
                            + Add Mapping
                        </button>
                    </div>
                </div>
            )}

            {condition.type === 'EXACT_MATCH' && (
                <div className="border-t pt-4 space-y-2">
                    <h5 className="text-sm font-medium text-gray-700">Match Options</h5>
                    {[
                        { key: 'caseSensitive', label: 'Case Sensitive', default: true },
                        { key: 'trimWhitespace', label: 'Trim Whitespace', default: false },
                        { key: 'normalizeWhitespace', label: 'Normalize Whitespace', default: false },
                        { key: 'removeSpecialCharacters', label: 'Remove Special Characters', default: false }
                    ].map(option => (
                        <label key={option.key} className="flex items-center">
                            <input
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                checked={condition.configuration?.[option.key] ?? option.default}
                                onChange={(e) => handleChange(`configuration.${option.key}`, e.target.checked)}
                            />
                            <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                        </label>
                    ))}
                </div>
            )}

            {condition.type === 'STATUS_CHECK' && (
                <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Allowed Values
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {(condition.configuration?.allowedValues || []).map((value: string, index: number) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                            >
                                {value}
                                <button
                                    type="button"
                                    onClick={() => {
                                        const values = condition.configuration?.allowedValues || [];
                                        handleChange('configuration.allowedValues', values.filter((_, i) => i !== index));
                                    }}
                                    className="ml-2 text-gray-600 hover:text-gray-800"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                        <input
                            type="text"
                            className="px-3 py-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Add value..."
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const target = e.target as HTMLInputElement;
                                    const values = condition.configuration?.allowedValues || [];
                                    if (target.value && !values.includes(target.value)) {
                                        handleChange('configuration.allowedValues', [...values, target.value]);
                                        target.value = '';
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            )}

            {condition.type === 'DATE_COMPARISON' && (
                <div className="border-t pt-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Reference Date
                        </label>
                        <select
                            value={condition.configuration?.referenceDate || 'CURRENT_DATE'}
                            onChange={(e) => handleChange('configuration.referenceDate', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                            <option value="CURRENT_DATE">Current Date</option>
                            <option value="SPECIFIC_DATE">Specific Date</option>
                        </select>
                    </div>

                    {condition.configuration?.referenceDate === 'SPECIFIC_DATE' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Date
                            </label>
                            <input
                                type="date"
                                value={condition.configuration?.specificDate || ''}
                                onChange={(e) => handleChange('configuration.specificDate', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                    )}

                    {condition.operator === 'WITHIN_DAYS' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Threshold Days
                            </label>
                            <input
                                type="number"
                                value={condition.configuration?.thresholdDays || ''}
                                onChange={(e) => handleChange('configuration.thresholdDays', parseInt(e.target.value))}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                min="0"
                            />
                        </div>
                    )}
                </div>
            )}

            {condition.type === 'BOOKING_MATCH' && (
                <div className="border-t pt-4 space-y-4">
                    <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Prefix Handling</h5>
                        <label className="flex items-center mb-2">
                            <input
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                checked={condition.configuration?.prefixHandling?.enabled || false}
                                onChange={(e) => handleChange('configuration.prefixHandling.enabled', e.target.checked)}
                            />
                            <span className="ml-2 text-sm text-gray-700">Enable Prefix Stripping</span>
                        </label>

                        {condition.configuration?.prefixHandling?.enabled && (
                            <>
                                <div className="mb-2">
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                        Prefixes to Strip
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {(condition.configuration?.prefixHandling?.prefixes || []).map((prefix: string, index: number) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                                            >
                                                {prefix}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const prefixes = condition.configuration?.prefixHandling?.prefixes || [];
                                                        handleChange('configuration.prefixHandling.prefixes', prefixes.filter((_, i) => i !== index));
                                                    }}
                                                    className="ml-2 text-gray-600 hover:text-gray-800"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                        <input
                                            type="text"
                                            className="px-3 py-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            placeholder="Add prefix..."
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const target = e.target as HTMLInputElement;
                                                    const prefixes = condition.configuration?.prefixHandling?.prefixes || [];
                                                    if (target.value && !prefixes.includes(target.value)) {
                                                        handleChange('configuration.prefixHandling.prefixes', [...prefixes, target.value]);
                                                        target.value = '';
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        checked={condition.configuration?.prefixHandling?.caseInsensitive || false}
                                        onChange={(e) => handleChange('configuration.prefixHandling.caseInsensitive', e.target.checked)}
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Case Insensitive</span>
                                </label>
                            </>
                        )}
                    </div>

                    <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Matching Strategies</h5>
                        {(condition.configuration?.strategies || []).map((strategy: any, index: number) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-3 mb-2">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-900">Strategy #{index + 1}</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const strategies = condition.configuration?.strategies || [];
                                            handleChange('configuration.strategies', strategies.filter((_, i) => i !== index));
                                        }}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                                <select
                                    value={strategy.type || 'DIRECT_OMS'}
                                    onChange={(e) => {
                                        const strategies = [...(condition.configuration?.strategies || [])];
                                        strategies[index] = { ...strategies[index], type: e.target.value };
                                        handleChange('configuration.strategies', strategies);
                                    }}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                >
                                    <option value="DIRECT_OMS">Direct OMS</option>
                                    <option value="HMS_MAPPING">HMS Mapping</option>
                                </select>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => {
                                const strategies = condition.configuration?.strategies || [];
                                handleChange('configuration.strategies', [...strategies, { type: 'DIRECT_OMS' }]);
                            }}
                            className="text-sm text-blue-600 hover:text-blue-700"
                        >
                            + Add Strategy
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
