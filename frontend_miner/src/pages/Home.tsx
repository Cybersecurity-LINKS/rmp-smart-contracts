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
import {CalendarDate, getLocalTimeZone, today} from '@internationalized/date';

import {mintNFT} from "../scripts/deploy_nft.ts";

import {
    sanitizeInput,
    isValidName,
    isValidPassportID,
    sanitizeQuantity,
    sanitizeID
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
        passportId: string;
        creationDate: string;
        typeOfMaterial: string;
        quality: string;
        productionPeriod: string;
        quantity: string;
        unit: string;
        company: string;
        mine: string;
        info: string;
        note: string;
        disclaimerAccepted: boolean
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
                Name: json.typeOfMaterial + '-' + json.passportId,
                nftAddress: address.nftAddress,
                dtAddress: address.dtAddress,
                DTquantity: json.quantity,
            };

            // Create blob with JSON data
            const blob = new Blob([JSON.stringify(dataToDownload, null, 2)], {type: 'application/json'});

            // Create an URL for blob
            const url = window.URL.createObjectURL(blob);

            // Create a temporary <a> element for the download
            const link = document.createElement('a');
            link.href = url;
            link.download = json.typeOfMaterial + '-' + json.passportId + '.json';

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
        const sanitizedTypeOfMaterial = sanitizeInput(formValues.typeOfMaterial);

        return (
            //!!sanitizedPassportId &&
            !!sanitizedTypeOfMaterial &&
            !!formValues.company &&
            !!formValues.creationDate &&
            !!formValues.productionPeriod &&
            isValidPassportID(formValues.passportId) &&
            isValidName(sanitizedTypeOfMaterial) &&
            formValues.passportId.length <= 10 &&
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
        passportId: '789273311',
        creationDate: maxDate.toString(),
        typeOfMaterial: 'Platinum',
        quality: 'Raw',
        productionPeriod: '2024-03-01 - 2024-03-31',
        quantity: '224.92',
        unit: 'oz',
        company: companies[0].label,
        mine: 'DigiMine',
        info: 'Ore Mined 1248 tons, Platinum Content 6.47 g/t, Downtime 0.64 hours, Labor Availability 94.07%, Recovery Rate 86.63%, Waste Rock 316.41 tons',
        note: 'SAMPLE data (not real production data), for TEST purposes only',
        disclaimerAccepted: true
    });

    useEffect(() => {
        console.log(`Form values changed: ${JSON.stringify(formValues)}`);
    }, [formValues]);

    //HANDLE FUNCTIONS
    //Wrapper for company change
    const handleCompanyChange = (value: string) => {
        setFormValues(prev => ({
            ...prev,
            company: companies.find(company => company.key === value)?.label || ''
        }));
    };

    //Wrapper for Date change
    const handleDateChange = (date: DateValue | null) => {
        if (date) {
            console.log('Raw ' + date);
            // Convert the DateValue to a string in YYYY-MM-DD format
            const dateString = date.toString();
            console.log('String ' + dateString);
            console.log('form before ' + formValues.creationDate);
            setFormValues(prev => ({
                ...prev,
                creationDate: dateString
            }));
        } else {
            // If the date is null or invalid, we assign a void string (for button control reasons)
            setFormValues(prev => ({
                ...prev,
                creationDate: ''
            }));
        }
        console.log('form after ' + formValues.creationDate);
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
                productionPeriod: periodString
            }));
        } else {
            // If the date is null or invalid, we assign a void string (for button control reasons)
            setFormValues(prev => ({
                ...prev,
                productionPeriod: ''
            }));
        }
    };

    //Wrapper for input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        console.log(name, value, typeof value);
        // Remove non allowed chars
        let sanitizedValue = '';
        if (name == "passportId") {
            sanitizedValue = sanitizeID(value)
        } else if (name == "quantity") {
            sanitizedValue = sanitizeQuantity(value)
        } else {
            sanitizedValue = value.replace(/[^A-Za-zÀ-ÿ\s'-]/g, '');
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
            const sanitizedPassportId = sanitizeInput(formValues.passportId);
            const sanitizedTypeOfMaterial = sanitizeInput(formValues.typeOfMaterial);
            const sanitazedQuality = sanitizeInput(formValues.quality);
            const sanitizedQuantity = sanitizeInput(formValues.quantity);
            const sanitizedUnit = sanitizeInput(formValues.unit);
            const sanitazedCompany = sanitizeInput(formValues.company);
            const sanitizedMine = sanitizeInput(formValues.mine);
            const sanitizedInfo = sanitizeInput(formValues.info);
            const sanitizedNote = sanitizeInput(formValues.note);

            await creteJSONfile({
                passportId: sanitizedPassportId,
                creationDate: formValues.creationDate,
                typeOfMaterial: sanitizedTypeOfMaterial,
                quality: sanitazedQuality,
                productionPeriod: formValues.productionPeriod,
                quantity: sanitizedQuantity,
                unit: sanitizedUnit,
                company: sanitazedCompany,
                mine: sanitizedMine,
                info: sanitizedInfo,
                note: sanitizedNote,
                disclaimerAccepted: true,
            }, setFeedback);

            // in case of success, reset form
            setFormValues({
                passportId: '',
                creationDate: today(getLocalTimeZone()).toString(),
                typeOfMaterial: '',
                quality: '',
                productionPeriod: '',
                quantity: '',
                unit: '',
                company: '',
                mine: '',
                info: '',
                note: '',
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
            unit: value
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
                                name="passportId"
                                placeholder="Enter the passport id"
                                value={formValues.passportId}
                                onChange={handleInputChange}
                                variant="bordered"
                                classNames={{
                                    input: "bg-white"
                                }}
                                maxLength={50}
                            />

                            <DateInput
                                isRequired
                                label="Creation date"
                                labelPlacement="outside"
                                onChange={handleDateChange}
                                defaultValue={today(getLocalTimeZone())} //today(getLocalTimeZone())
                                minValue={minDate}
                                maxValue={maxDate}
                                variant="bordered"
                                classNames={{
                                    input: "bg-white"
                                }}
                                startContent={<Calendar className="text-default-500" size={20}/>}
                            />

                            <Input
                                isRequired
                                label="Type of material"
                                labelPlacement="outside"
                                name="typeOfMaterial"
                                placeholder="Enter the material"
                                value={formValues.typeOfMaterial}
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
                                name="quality"
                                placeholder="Enter the quality"
                                value={formValues.quality}
                                onChange={handleInputChange}
                                variant="bordered"
                                classNames={{
                                    input: "bg-white"
                                }}
                                maxLength={50}
                            />

                            <DateRangePicker
                                //isRequired
                                visibleMonths={2}
                                firstDayOfWeek="mon"
                                selectorButtonPlacement="end"
                                label="Production Period"
                                labelPlacement="outside"
                                defaultValue={{
                                    start: today(getLocalTimeZone()).subtract({months: 1}),
                                    end: today(getLocalTimeZone()),
                                }}
                                onChange={handleDateRangeChange}
                                minValue={minDate}
                                maxValue={maxDate}
                                variant="bordered"
                                classNames={{
                                    input: "bg-white"
                                }}
                                startContent={<Calendar className="text-default-500" size={20}/>}
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
                                            name="unit"
                                            value={formValues.unit}
                                            onChange={handleUnitChange}
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
                                name="quantity"
                                placeholder="Enter the material's quantity"
                                value={formValues.quantity}
                                onChange={handleInputChange}
                                variant="bordered"
                                classNames={{
                                    input: "bg-white"
                                }}
                                maxLength={50}
                            />

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
                                defaultSelectedKey={companies[1].key}
                                defaultItems={companies}
                                onSelectionChange={(key: React.Key | null) => handleCompanyChange(key?.toString() || '')}
                            >
                                {(item) => <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>}
                            </Autocomplete>

                            <Input
                                isRequired
                                label="Mine"
                                labelPlacement="outside"
                                name="mine"
                                placeholder="Enter mine name"
                                value={formValues.mine}
                                onChange={handleInputChange}
                                variant="bordered"
                                classNames={{
                                    input: "bg-white"
                                }}
                                maxLength={50}
                            />

                            <Textarea
                                //isRequired
                                label="Info"
                                labelPlacement="outside"
                                name="info"
                                placeholder="Enter some additional information"
                                value={formValues.info}
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
                                name="note"
                                placeholder="Enter some notes"
                                value={formValues.note}
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