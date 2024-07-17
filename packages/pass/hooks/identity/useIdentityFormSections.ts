import { type ComponentType, useCallback, useEffect, useMemo, useState } from 'react';

import type { FactoryOpts } from 'imask/masked/factory';
import cloneDeep from 'lodash/cloneDeep';
import { c } from 'ttag';

import { MaskedTextField } from '@proton/pass/components/Form/Field/MaskedTextField';
import { birthdateMask } from '@proton/pass/components/Form/Field/masks/identity';
import type { IdentityItemFormValues, ItemIdentity, UnsafeItemExtraField } from '@proton/pass/types';
import { isArrayOfType } from '@proton/pass/utils/array/is-type-of';

type FieldName = keyof ItemIdentity;

type IdentityField = {
    name: FieldName;
    label: string;
    placeholder: string;
    component?: ComponentType<any>;
    mask?: FactoryOpts;
    value?: string;
};

type FieldSection = {
    name: string;
    expanded: boolean;
    fields: IdentityField[];
    optionalFields?: {
        fields: IdentityField[];
        extraFieldKey?: FieldName;
    };
};

export const getInitialState = (shareId: string): IdentityItemFormValues => ({
    shareId,
    fullName: '',
    email: '',
    phoneNumber: '',
    firstName: '',
    middleName: '',
    lastName: '',
    birthdate: '',
    gender: '',
    organization: '',
    streetAddress: '',
    zipOrPostalCode: '',
    city: '',
    stateOrProvince: '',
    countryOrRegion: '',
    floor: '',
    county: '',
    socialSecurityNumber: '',
    passportNumber: '',
    licenseNumber: '',
    website: '',
    xHandle: '',
    linkedin: '',
    reddit: '',
    facebook: '',
    yahoo: '',
    instagram: '',
    secondPhoneNumber: '',
    company: '',
    jobTitle: '',
    personalWebsite: '',
    workPhoneNumber: '',
    workEmail: '',
    extraAddressDetails: [],
    extraSections: [],
    extraContactDetails: [],
    extraWorkDetails: [],
    extraPersonalDetails: [],
    name: '',
    note: '',
});

const buildCustomField = (fieldName: FieldName) => ({
    name: fieldName,
    label: c('Label').t`Custom field`,
    placeholder: c('Label').t`Custom field`,
});

type IdentityFormFields = Record<string, IdentityField>;
const getIdentityFields = (): IdentityFormFields => ({
    fullName: {
        name: 'fullName',
        label: c('Label').t`Full Name`,
        placeholder: c('Label').t`Full Name`,
    },
    email: {
        name: 'email',
        label: c('Label').t`Email`,
        placeholder: c('Label').t`Email`,
    },
    phoneNumber: {
        name: 'phoneNumber',
        label: c('Label').t`Phone number`,
        placeholder: c('Label').t`Phone number`,
    },
    firstName: {
        name: 'firstName',
        label: c('Label').t`First name`,
        placeholder: c('Label').t`First name`,
    },
    middleName: {
        name: 'middleName',
        label: c('Label').t`Middle name`,
        placeholder: c('Label').t`Middle name`,
    },
    lastName: {
        name: 'lastName',
        label: c('Label').t`Last name`,
        placeholder: c('Label').t`Last name`,
    },
    birthdate: {
        name: 'birthdate',
        label: c('Label').t`Birthdate`,
        placeholder: c('Label').t`Birthdate`,
        component: MaskedTextField,
        mask: birthdateMask,
    },
    gender: {
        name: 'gender',
        label: c('Label').t`Gender`,
        placeholder: c('Label').t`Gender`,
    },
    extraPersonalDetails: buildCustomField('extraPersonalDetails'),
    organization: {
        name: 'organization',
        label: c('Label').t`Organization`,
        placeholder: c('Label').t`Name`,
    },
    streetAddress: {
        name: 'streetAddress',
        label: c('Label').t`Street address, P.O. box`,
        placeholder: c('Label').t`Street address`,
    },
    floor: {
        name: 'floor',
        label: c('Label').t`Floor, apartment, building`,
        placeholder: c('Label').t`Additional details`,
    },
    zipOrPostalCode: {
        name: 'zipOrPostalCode',
        label: c('Label').t`ZIP or Postal code`,
        placeholder: c('Label').t`ZIP or Postal code`,
    },
    city: {
        name: 'city',
        label: c('Label').t`City`,
        placeholder: c('Label').t`City`,
    },
    stateOrProvince: {
        name: 'stateOrProvince',
        label: c('Label').t`State or province`,
        placeholder: c('Label').t`State or province`,
    },
    countryOrRegion: {
        name: 'countryOrRegion',
        label: c('Label').t`Country or Region`,
        placeholder: c('Label').t`Country or Region`,
    },
    socialSecurityNumber: {
        name: 'socialSecurityNumber',
        label: c('Label').t`Social security number`,
        placeholder: c('Label').t`Social security number`,
    },
    passportNumber: {
        name: 'passportNumber',
        label: c('Label').t`Passport number`,
        placeholder: c('Label').t`Passport number`,
    },
    licenseNumber: {
        name: 'licenseNumber',
        label: c('Label').t`License number`,
        placeholder: c('Label').t`License number`,
    },
    website: {
        name: 'website',
        label: c('Label').t`Website`,
        placeholder: c('Label').t`https://example.com`,
    },
    xHandle: {
        name: 'xHandle',
        label: c('Label').t`X handle`,
        placeholder: c('Label').t`@username`,
    },
    secondPhoneNumber: {
        name: 'secondPhoneNumber',
        label: c('Label').t`Phone number`,
        placeholder: c('Label').t`Phone number`,
    },
    company: {
        name: 'company',
        label: c('Label').t`Company`,
        placeholder: c('Label').t`Company`,
    },
    jobTitle: {
        name: 'jobTitle',
        label: c('Label').t`Job title`,
        placeholder: c('Label').t`Job title`,
    },
    personalWebsite: {
        name: 'personalWebsite',
        label: c('Label').t`Personal website`,
        placeholder: c('Label').t`Personal website`,
    },
    workPhoneNumber: {
        name: 'workPhoneNumber',
        label: c('Label').t`Work phone number`,
        placeholder: c('Label').t`Work phone number`,
    },
    workEmail: {
        name: 'workEmail',
        label: c('Label').t`Work email`,
        placeholder: c('Label').t`Work email`,
    },
    extraWorkDetails: buildCustomField('extraWorkDetails'),
});

const buildNewFormSections = (identityFields: IdentityFormFields): FieldSection[] => [
    {
        name: c('Label').t`Personal details`,
        expanded: true,
        fields: [identityFields.fullName, identityFields.email, identityFields.phoneNumber],
        optionalFields: {
            extraFieldKey: 'extraPersonalDetails',
            fields: [
                identityFields.firstName,
                identityFields.middleName,
                identityFields.lastName,
                identityFields.birthdate,
                identityFields.gender,
                identityFields.extraPersonalDetails,
            ],
        },
    },
    {
        name: c('Label').t`Address details`,
        expanded: true,
        fields: [
            identityFields.organization,
            identityFields.streetAddress,
            identityFields.floor,
            identityFields.zipOrPostalCode,
            identityFields.city,
            identityFields.stateOrProvince,
            identityFields.countryOrRegion,
        ],
    },
    {
        name: c('Label').t`Contact details`,
        expanded: false,
        fields: [
            identityFields.socialSecurityNumber,
            identityFields.passportNumber,
            identityFields.licenseNumber,
            identityFields.website,
            identityFields.xHandle,
            identityFields.secondPhoneNumber,
        ],
    },
    {
        name: c('Label').t`Work details`,
        expanded: false,
        fields: [identityFields.company, identityFields.jobTitle],
        optionalFields: {
            extraFieldKey: 'extraWorkDetails',
            fields: [
                identityFields.personalWebsite,
                identityFields.workPhoneNumber,
                identityFields.workEmail,
                identityFields.extraWorkDetails,
            ],
        },
    },
];

const isUnsafeItemExtraFieldArray = (value: any): value is UnsafeItemExtraField[] =>
    isArrayOfType(value, (item: any): item is UnsafeItemExtraField => typeof item.data?.content === 'string');

const mapToIdentityField = (fields: UnsafeItemExtraField[], fieldName: string): IdentityField[] =>
    fields.map((customField) => ({
        label: customField.fieldName,
        placeholder: customField.fieldName,
        name: fieldName as FieldName,
        value: customField.type === 'text' ? customField.data.content : '',
    }));

const buildEditFormSections = (identityFields: IdentityFormFields, initialValues: ItemIdentity): FieldSection[] => {
    const formSections = buildNewFormSections(identityFields);
    return formSections.map<FieldSection>((section) => {
        const { fields = [], optionalFields = [] } = Object.groupBy(section?.optionalFields?.fields ?? [], (field) =>
            !field.name.includes('extra') && initialValues[field.name] ? 'fields' : 'optionalFields'
        );

        section.fields.push(...fields);
        if (section.optionalFields) section.optionalFields.fields = optionalFields;

        return section;
    });
};

export const useIdentityFormSections = (initialValues?: ItemIdentity) => {
    const identityFields = useMemo(() => getIdentityFields(), []);
    const [sections, setSections] = useState<FieldSection[]>([]);
    const getField = useCallback(
        (index: number, fieldName: string) =>
            sections[index].optionalFields?.fields.find(({ name }) => name === fieldName)!,
        [sections]
    );

    const updateSectionFields = (index: number, fieldName: string) => {
        const newField = getField(index, fieldName);

        setSections((prevSections) => {
            const newSections = cloneDeep(prevSections);
            const section = newSections[index];

            // Add the new field to main the fields array
            section.fields.push(newField);

            // Remove the field from the "extras" dropdown
            if (section.optionalFields) {
                section.optionalFields.fields = section.optionalFields.fields.filter(
                    ({ name }) => name !== newField.name
                );
            }

            return newSections;
        });
    };

    const getFilteredSections = (identity: ItemIdentity): FieldSection[] =>
        sections
            .reduce<FieldSection[]>((fieldSections, section) => {
                const fields = [...section.fields, ...(section.optionalFields?.fields ?? [])];

                const filteredFields = fields.reduce<IdentityField[]>((acc, field) => {
                    const fieldName = field.name;
                    const fieldValue = identity[fieldName];

                    if (!fieldValue) return acc;
                    if (!Array.isArray(fieldValue)) return [...acc, { ...field, value: fieldValue }];

                    if (isUnsafeItemExtraFieldArray(fieldValue)) {
                        return [...acc, ...mapToIdentityField(fieldValue, fieldName)];
                    }

                    return acc;
                }, []);

                if (!filteredFields.length) return fieldSections;

                section.fields = filteredFields;

                return [...fieldSections, section];
            }, [])
            .concat(
                identity.extraSections.map<FieldSection>((section) => ({
                    name: section.sectionName,
                    fields: mapToIdentityField(section.sectionFields, section.sectionName),
                    expanded: true,
                }))
            );

    useEffect(() => {
        if (initialValues) setSections(buildEditFormSections(identityFields, initialValues));
        else setSections(buildNewFormSections(identityFields));
    }, []);

    return { sections, getFilteredSections, updateSectionFields };
};
