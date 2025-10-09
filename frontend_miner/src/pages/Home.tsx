import {Layout} from '../components/Layout';
import {
    Card,
    CardBody,
    Button,
    Input,
    Form,
    DateInput,
    DateValue,
    Alert,
    Checkbox,
    DateRangePicker,
    RangeValue,
    AutocompleteItem,
    Autocomplete,
    Textarea, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure,
    ModalFooter,
} from "@heroui/react";
import {useState, useEffect, useRef} from 'react';
import {Calendar, Copy} from 'lucide-react';
import {CalendarDate, getLocalTimeZone, parseDate, today} from '@internationalized/date';

import {mintNFT} from "../scripts/deploy_nft.ts";

import {
    sanitizeInput,
    isValidName,
    isValidPassportID,
    sanitizeQuantity,
    sanitizeID,
    sanitizeOnlyLettersAndNumbers,
    sanitizeOnlyLetters,
    sanitizeBasic,
    sanitizeRichText
} from '../utils/validation';

// Define feedback states
type FeedbackState = {
    type: 'success' | 'error' | 'loading' | null;
    message: string;
    visible: boolean;
};

export const companies = [
    {key: "1", label: "LINKS Foundation"},
    //{ key: "2", label: " ITAINNOVA" },
    //{ key: "3", label: "CORE Innovation Centre" },
    //{ key: "4", label: "Institute of Communication and Computer Systems" },
    //{ key: "5", label: "Fraunhofer Institute" },
    //{ key: "6", label: "GIG Research Institute" },
    //{ key: "7", label: "University of Thrace" },
    //{ key: "8", label: "Tampere University" },
    //{ key: "9", label: "Aristotle University of Thessaloniki" },
    {key: "10", label: "Wits Mining Institute"},
    //{ key: "11", label: "SUBTERRA" },
    //{ key: "12", label: "AuroraGeo Consulting" },
    //{ key: "13", label: "LIBRA AI Technologies" },
    //{ key: "14", label: "STRATAGEM Energy Ltd" },
    //{ key: "15", label: "Terradue" },
    //{ key: "16", label: "DARES" },
    //{ key: "17", label: "DigitalTwin Technology GmbH" },
    {key: "18", label: "Tapojarvi"},
    {key: "19", label: "Tharsis Mining"},
    {key: "20", label: "TERNA MAG"},
    {key: "21", label: "JSW SA"},
    {key: "22", label: "Eticas"},
];


function HomePage() {

    interface AddressInfo {
        nftAddress: string;
        dtAddress: string;
    }

    const [address, setAddress] = useState<AddressInfo | null>(null);
    const [jsonString, setJsonString] = useState<string>('');

    async function creteJSONfile(param: {
        '01_passportId': string;
        '02_creationDate': string;
        '03_typeOfMaterial': string;
        '04_quality': string;
        '05_productionPeriod': string;
        '06_quantity': string;
        '07_unit': string;
        '08_company': string;
        '09_mine': string;
        '10_info': string;
        '11_note': string;
        '12_disclaimerAccepted': boolean
    }, setFeedback: (feedback: FeedbackState) => void) {

        let jsonString = "";

        try {
            setFeedback({type: 'loading', message: ' Minting... 🪨⛏️', visible: true})

            jsonString = JSON.stringify(param, null, 2);
            //console.log(jsonString)
            setJsonString(jsonString)
        } catch (e) {
            console.log(e);
        }

        const addrs = await mintNFT(jsonString);

        console.log("Mint END")
        console.log(addrs)
        setAddress(addrs)

        setFeedback({type: 'success', message: 'Created ✅', visible: true});

        onOpen()

    }

    const handleDownload = () => {
        if (address) {
            const json = JSON.parse(jsonString);
            const dataToDownload = {
                Name: json["03_typeOfMaterial"] + '-' + json['01_passportId'],
                nftAddress: address.nftAddress,
                dtAddress: address.dtAddress,
                DTquantity: json['06_quantity'],
            };

            // Create blob with JSON data
            const blob = new Blob([JSON.stringify(dataToDownload, null, 2)], {type: 'application/json'});

            // Create an URL for blob
            const url = window.URL.createObjectURL(blob);

            // Create a temporary <a> element for the download
            const link = document.createElement('a');
            link.href = url;
            link.download = json["03_typeOfMaterial"] + '-' + json['01_passportId'] + '.json';

            // Simulates clicking on the link to start the download
            document.body.appendChild(link);
            link.click();

            // Clean up
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            // Close the modal
            onClose();
        }
    };


    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                // Optional: add a visual feedback here
                console.log('Text copied to clipboard!');
            })
            .catch((err) => {
                console.error('Error coping the value', err);
            });
    };


    // Ref for main container and feedback
    const containerRef = useRef<HTMLDivElement>(null);
    const feedbackRef = useRef<HTMLDivElement>(null);

    // Minting response status
    const [feedback, setFeedback] = useState<FeedbackState>({
        type: null,
        message: '',
        visible: false
    });

    const [isPulsing, setIsPulsing] = useState(false);

    // Automatic scroll
    useEffect(() => {
        if (feedback.visible && feedback.type !== null) {
            // Scroll up
            window.scrollTo({top: 0, behavior: 'smooth'});

        }
        if (feedback.message && feedback.visible && feedback.type == 'loading') {
            // Pulse animation
            setIsPulsing(true);
        }
    }, [feedback.visible, feedback.type]);

    // Hide feedback after a while
    useEffect(() => {
        if (feedback.message && feedback.visible && feedback.type !== 'loading') {
            setIsPulsing(false);
            const timer = setTimeout(() => {
                setFeedback(prev => ({...prev, visible: false}));
            }, 5000); // 5 seconds

            return () => clearTimeout(timer);
        }
    }, [feedback.message, feedback.visible, feedback.type]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure();


    // Control value to lock/unlock Mint button
    const isFormValid = (): boolean => {
        //const sanitizedPassportId = sanitizeInput(formValues.passportId);
        const sanitizedTypeOfMaterial = sanitizeInput(formValues["03_typeOfMaterial"]);

        return (
            //!!sanitizedPassportId &&
            !!sanitizedTypeOfMaterial &&
            !!formValues["08_company"] &&
            !!formValues["02_creationDate"] &&
            isValidPassportID(formValues["01_passportId"]) &&
            isValidName(sanitizedTypeOfMaterial) &&
            formValues["01_passportId"].length <= 10 &&
            sanitizedTypeOfMaterial.length <= 10 &&
            formValues.disclaimerAccepted
        );
    };

    // Calculate min and max dates for the date picker (mindate: 100 years ago from now, maxdate: today)
    const todayDate = new Date();
    const maxDate = new CalendarDate(
        todayDate.getFullYear(),
        todayDate.getMonth() + 1,
        todayDate.getDate()
    );

    const minDate = new CalendarDate(
        todayDate.getFullYear() - 100,
        todayDate.getMonth() + 1,
        todayDate.getDate()
    );

    //Form state
    const [formValues, setFormValues] = useState({
        '01_passportId': '789273311',
        '02_creationDate': maxDate.toString(),
        '03_typeOfMaterial': 'Platinum',
        '04_quality': 'Raw',
        '05_productionPeriod': '2024-03-01 - 2024-03-31',
        '06_quantity': '224',
        '07_unit': 'kg',
        '08_company': companies[0].label,
        '09_mine': 'LINKS Mine',
        '10_info': 'Ore Mined 1248 tons, Platinum Content 6.47 g/t, Downtime 0.64 hours, Labor Availability 94.07%, Recovery Rate 86.63%, Waste Rock 316.41 tons',
        '11_note': 'SAMPLE data (not real production data), for TEST purposes only',
        '12_disclaimerAccepted': true
    });

    useEffect(() => {
        console.log(`Form values changed: ${JSON.stringify(formValues)}`);
    }, [formValues]);

    //HANDLE FUNCTIONS
    //Wrapper for company change
    const handleCompanyChange = (value: string) => {
        setFormValues(prev => ({
            ...prev,
            '08_company': companies.find(company => company.key === value)?.label || ''
        }));
    };

    //Wrapper for Date change
    const handleDateChange = (date: DateValue | null) => {
        if (date) {
            console.log('Raw ' + date);
            // Convert the DateValue to a string in YYYY-MM-DD format
            const dateString = date.toString();
            console.log('String ' + dateString);
            console.log('form before ' + formValues["02_creationDate"]);
            setFormValues(prev => ({
                ...prev,
                '02_creationDate': dateString
            }));
        } else {
            // If the date is null or invalid, we assign a void string (for button control reasons)
            setFormValues(prev => ({
                ...prev,
                '02_creationDate': ''
            }));
        }
        console.log('form after ' + formValues["02_creationDate"]);
    };

    //Wrapper for Date change
    const handleDateRangeChange = (period: RangeValue<DateValue> | null) => {
        if (period) {
            // Convert the DateValue to a string in YYYY-MM-DD format
            console.log(period);
            const periodString = period.start.toString() + ' - ' + period.end.toString();
            console.log(periodString);
            setFormValues(prev => ({
                ...prev,
                '05_productionPeriod': periodString
            }));
        } else {
            // If the date is null or invalid, we assign a void string (for button control reasons)
            setFormValues(prev => ({
                ...prev,
                '05_productionPeriod': ''
            }));
        }
    };

    //Wrapper for input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        console.log(name, value, typeof value);
        // Remove non-allowed chars
        let sanitizedValue = sanitizeBasic(value);
        if (name == "01_passportId") {
            sanitizedValue = sanitizeID(value)
        } else if (name == "06_quantity") {
            sanitizedValue = sanitizeQuantity(value)
        } else if (name == "03_typeOfMaterial") {
            sanitizedValue = sanitizeOnlyLettersAndNumbers(value)
        } else if (name == "04_quality") {
            sanitizedValue = sanitizeOnlyLettersAndNumbers(value);
        } else if (name == "09_mine") {
            sanitizedValue = sanitizeOnlyLetters(value);
        } else if (name == "10_info" || name == "11_note") {
            sanitizedValue = sanitizeRichText(value);
        } else {
            sanitizedValue = value;
        }

        setFormValues(prev => ({
            ...prev,
            [name]: sanitizedValue
        }));
    };


    // Wrapper to manage submit (Mint button)
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Create a temporary object to store only non-empty fields
            const formData: { [key: string]: string | boolean } = {};

            // List of fields to check
            const fields = [
                {key: '01_passportId', value: sanitizeInput(formValues["01_passportId"])},
                {key: '02_creationDate', value: formValues["02_creationDate"]},
                {key: '03_typeOfMaterial', value: sanitizeInput(formValues["03_typeOfMaterial"])},
                {key: '04_quality', value: sanitizeInput(formValues["04_quality"])},
                {key: '05_productionPeriod', value: formValues["05_productionPeriod"]},
                {key: '06_quantity', value: sanitizeInput(formValues["06_quantity"])},
                {key: '07_unit', value: sanitizeInput(formValues["07_unit"])},
                {key: '08_company', value: sanitizeInput(formValues["08_company"])},
                {key: '09_mine', value: sanitizeInput(formValues["09_mine"])},
                {key: '10_info', value: sanitizeInput(formValues["10_info"])},
                {key: '11_note', value: sanitizeInput(formValues["11_note"])}
            ];

            // Add only the non-empty fields to the formData object
            fields.forEach(({key, value}) => {
                if (value && value.trim() !== '') {
                    formData[key] = value;
                }
            });

            // Always add disclaimerAccepted
            formData.disclaimerAccepted = true;

            // Call creteJSONfile with the filtered data
            await creteJSONfile(formData as any, setFeedback);

            // Reset del form come prima
            setFormValues({
                '01_passportId': '',
                '02_creationDate': today(getLocalTimeZone()).toString(),
                '03_typeOfMaterial': '',
                '04_quality': '',
                '05_productionPeriod': '',
                '06_quantity': '',
                '07_unit': 'kg',
                '08_company': '',
                '09_mine': '',
                '10_info': '',
                '11_note': '',
                disclaimerAccepted: false
            });
        } catch (error) {
            console.error('Error requesting credential:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const {value} = e.target;
        console.log(value);
        setFormValues(prev => ({
            ...prev,
            '07_unit': value
        }));
    };


    return (
        <Layout>
            <div ref={containerRef} className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold text-center text-primary-500 mb-8">
                    Insert Your RMP Data
                </h1>
                <p className="text-lg text-default-600 text-center mb-12 max-w-2xl mx-auto">
                    to create an NFT and the correlated DataToken on the DLT
                </p>

                <div
                    ref={feedbackRef}
                    className={`transition-all duration-500 ease-in-out ${
                        feedback.type && feedback.visible ? 'opacity-100 max-h-20 mb-8 mt-0' : 'opacity-0 max-h-0 my-0 overflow-hidden'
                    } ${isPulsing ? 'animate-pulse' : ''}`}
                >
                    <Alert
                        className={`transition-all duration-500 ${feedback.type && feedback.visible ? 'mb-6' : 'm-0'}`}
                        color={feedback.type === 'success' ? 'success' : feedback.type === 'error' ? 'danger' : 'primary'}
                        variant="faded"
                    >
                        {feedback.message}
                    </Alert>
                </div>
                <div>

                    <Modal
                        isOpen={isOpen}
                        onOpenChange={onOpenChange}
                        hideCloseButton={true}
                        isDismissable={false}
                    >
                        <ModalContent>
                            {(onClose) => (
                                <>
                                    <ModalHeader className="flex flex-col gap-1">
                                        <h3 className="text-xl font-bold">NFT and Data Token created ✅</h3>
                                        <p className="text-sm text-default-500">Insert these data in MetaMask🦊</p>
                                    </ModalHeader>

                                    <ModalBody>
                                        {address && (
                                            <>
                                                <p className="mb-4 flex items-center justify-between">
                              <span>
                                <span className="font-bold">NFT Address:</span><br/>
                                  {address.nftAddress}
                              </span>
                                                    <Button
                                                        isIconOnly
                                                        color="primary"
                                                        variant="light"
                                                        onClick={() => copyToClipboard(address.nftAddress)}
                                                        className="ml-2"
                                                    >
                                                        <Copy size={20}/>
                                                    </Button>
                                                </p>
                                                <p className="flex items-center justify-between">
                                <span>
                                  <span className="font-bold">Data Token Address:</span><br/>
                                    {address.dtAddress}
                                </span>
                                                    <Button
                                                        isIconOnly
                                                        color="primary"
                                                        variant="light"
                                                        onClick={() => copyToClipboard(address.dtAddress)}
                                                        className="ml-2"
                                                    >
                                                        <Copy size={20}/>
                                                    </Button>
                                                </p>
                                            </>
                                        )}
                                        <div className="flex items-center justify-center w-full">
                                            <Alert color={"danger"}
                                                   description={"Downloading the file let's you avoid to lose the addresses of the minted items"}
                                                   title={"NOTE"}/>
                                        </div>
                                    </ModalBody>
                                    <ModalFooter>

                                        <Button color="danger" onPress={onClose}>
                                            Close Anyway
                                        </Button>


                                        <Button color="primary" variant="bordered" onPress={handleDownload}
                                                className="bg-primary-600 hover:bg-primary-700 text-white">
                                            Download
                                        </Button>
                                    </ModalFooter>
                                </>
                            )}
                        </ModalContent>
                    </Modal>

                </div>

                <Card className="bg-white shadow-lg border border-gray-100">
                    <CardBody className="flex flex-col gap-8 p-8">
                        <Form
                            className="flex flex-col gap-6"
                            onSubmit={handleSubmit}
                        >
                            <Input
                                isRequired
                                label="Passport Id"
                                labelPlacement="outside"
                                name="01_passportId"
                                placeholder="Enter the passport id"
                                value={formValues["01_passportId"]}
                                onChange={handleInputChange}
                                variant="bordered"
                                classNames={{
                                    input: "bg-white"
                                }}
                                maxLength={50}
                            />

                            <div className="flex w-full gap-6">
                                <Autocomplete
                                    isRequired
                                    //isVirtualized
                                    labelPlacement="outside"
                                    label="Company"
                                    placeholder="Select a company"
                                    classNames={{
                                        base: "max-w-full",
                                        listbox: "bg-white",
                                        popoverContent: "border border-default-200 bg-white"
                                    }}
                                    variant="bordered"
                                    selectedKey={companies.find(c => c.label === formValues["08_company"])?.key || ''}
                                    defaultItems={companies}
                                    onSelectionChange={(key: React.Key | null) => handleCompanyChange(key?.toString() || '')}
                                >
                                    {(item) => <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>}
                                </Autocomplete>

                                <Input
                                    isRequired
                                    label="Mine"
                                    labelPlacement="outside"
                                    name="09_mine"
                                    placeholder="Enter mine name"
                                    value={formValues["09_mine"]}
                                    onChange={handleInputChange}
                                    variant="bordered"
                                    classNames={{
                                        input: "bg-white"
                                    }}
                                    maxLength={50}
                                />
                            </div>

                            <div className="flex w-full gap-6">
                                <DateInput
                                    isRequired
                                    label="Creation date"
                                    labelPlacement="outside"
                                    onChange={handleDateChange}
                                    value={formValues["02_creationDate"] ? parseDate(formValues["02_creationDate"]) : null} //today(getLocalTimeZone())
                                    minValue={minDate}
                                    maxValue={maxDate}
                                    variant="bordered"
                                    classNames={{
                                        input: "bg-white"
                                    }}
                                    startContent={<Calendar className="text-default-500" size={20}/>}
                                />

                                <DateRangePicker
                                    //isRequired
                                    visibleMonths={2}
                                    firstDayOfWeek="mon"
                                    selectorButtonPlacement="end"
                                    label="Production Period"
                                    labelPlacement="outside"
                                    value={formValues["05_productionPeriod"] ? {
                                        start: new CalendarDate(...formValues["05_productionPeriod"].split(' - ')[0].split('-').map(Number)),
                                        end: new CalendarDate(...formValues["05_productionPeriod"].split(' - ')[1].split('-').map(Number))
                                    } : null}
                                    onChange={handleDateRangeChange}
                                    minValue={minDate}
                                    maxValue={maxDate}
                                    variant="bordered"
                                    classNames={{
                                        input: "bg-white"
                                    }}
                                    startContent={<Calendar className="text-default-500" size={20}/>}
                                />

                            </div>
                            
                            <div className="flex w-full gap-6">
                                <Input
                                    isRequired
                                    label="Type of material"
                                    labelPlacement="outside"
                                    name="03_typeOfMaterial"
                                    placeholder="Enter the material"
                                    value={formValues["03_typeOfMaterial"]}
                                    onChange={handleInputChange}
                                    variant="bordered"
                                    classNames={{
                                        input: "bg-white"
                                    }}
                                    maxLength={50}
                                />
                                <Input
                                    //isRequired
                                    label="Quality"
                                    labelPlacement="outside"
                                    name="04_quality"
                                    placeholder="Enter the quality"
                                    value={formValues["04_quality"]}
                                    onChange={handleInputChange}
                                    variant="bordered"
                                    classNames={{
                                        input: "bg-white"
                                    }}
                                    maxLength={50}
                                />

                                <Input
                                    endContent={
                                        <div className="flex items-center">
                                            <label className="sr-only" htmlFor="unit">
                                                Unit
                                            </label>
                                            <select
                                                className="outline-none border-0 bg-transparent text-default-400 text-small"
                                                id="unit"
                                                name="07_unit"
                                                onChange={handleUnitChange}
                                                defaultValue="kg"
                                            >
                                                <option>kg</option>
                                                <option>lb</option>
                                                <option>oz</option>
                                            </select>
                                        </div>
                                    }
                                    isRequired
                                    //type="number"
                                    label="Quantity"
                                    labelPlacement="outside"
                                    name="06_quantity"
                                    placeholder="Enter the quantity"
                                    value={formValues["06_quantity"]}
                                    onChange={handleInputChange}
                                    variant="bordered"
                                    classNames={{
                                        input: "bg-white"
                                    }}
                                    maxLength={50}
                                />
                            </div>


                            <Textarea
                                //isRequired
                                label="Info"
                                labelPlacement="outside"
                                name="10_info"
                                placeholder="Enter some additional information"
                                value={formValues["10_info"]}
                                onChange={handleInputChange}
                                variant="bordered"
                                classNames={{
                                    input: "bg-white"
                                }}
                                maxLength={500}
                            />

                            <Textarea
                                //isRequired
                                label="NOTE"
                                labelPlacement="outside"
                                name="11_note"
                                placeholder="Enter some notes"
                                value={formValues["11_note"]}
                                onChange={handleInputChange}
                                variant="bordered"
                                classNames={{
                                    input: "bg-white"
                                }}
                                maxLength={500}
                            />


                            <div className="px-8 py-4 bg-default-50 rounded-lg border border-default-200">
                                <div className="flex flex-col gap-4">
                                    <p className="text-sm text-default-600">
                                        Please do not enter personal or sensitive data in this test form.
                                    </p>
                                    <Checkbox
                                        isSelected={formValues.disclaimerAccepted}
                                        onValueChange={(checked) => setFormValues(prev => ({
                                            ...prev,
                                            disclaimerAccepted: checked
                                        }))}
                                        color="danger"
                                    >
                                        <p className="text-sm text-default-600">
                                            I hereby declare that I have read the above instructions.
                                        </p>
                                    </Checkbox>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-4">
                                <Button
                                    color="primary"
                                    type="submit"
                                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
                                    size="lg"
                                    isDisabled={!isFormValid() || isSubmitting}
                                    isLoading={isSubmitting}
                                >
                                    {isSubmitting ? 'Minting... 🪨⛏️' : 'Mint ⛏️'}
                                </Button>
                            </div>
                        </Form>
                    </CardBody>
                </Card>
            </div>
        </Layout>
    );
}

export default HomePage;