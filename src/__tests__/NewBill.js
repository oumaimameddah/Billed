/**
 * @jest-environment jsdom
 */

import {fireEvent, screen} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {localStorageMock} from "../__mocks__/localStorage.js";
import store from "../__mocks__/store.js";
import {ROUTES} from "../constants/routes.js";

const onNavigate = (pathname) => {
    document.body.innerHTML = ROUTES({pathname});
};

describe("Given I am connected as an employee", () => {

    Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
    });

    window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
    }));

    describe("When I am on NewBill Page", () => {
        test("Then the newBill page should be rendered", () => {
            // DOM construction
            document.body.innerHTML = NewBillUI();
            // expected result
            expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy();
        })

        test("The the form 'Envoyer une note de frais' should be rendered", () => {
            // DOM construction
            document.body.innerHTML = NewBillUI();
            // get DOM element
            const form = document.querySelector('form');
            // expected result
            expect(form.length).toEqual(9);
        });

        describe('When I add an attached file', () => {
            // TEST : handle attached file format
            test('Then the file handler should be run', () => {
                // DOM construction
                document.body.innerHTML = NewBillUI();
                // get DOM element
                const newBill = new NewBill({
                    document, onNavigate, store: store, localStorage: window.localStorage,
                });
                // handle event
                const handleChangeFile = jest.fn(() => newBill.handleChangeFile);
                const attachedFile = screen.getByTestId('file');
                attachedFile.addEventListener('change', handleChangeFile);
                fireEvent.change(attachedFile, {
                    target: {
                        files: [new File(['file.txt'], 'file.txt', {type: 'text/txt'})],
                    },
                });
                // expected result
                const numberOfFile = screen.getByTestId('file').files.length;
                expect(numberOfFile).toEqual(1);
            });
        });

        describe('when I submit a correct form', () => {
            // TEST : submit correct form and attached file
            test('then I should be redirected to Bills page', () => {
                // DOM construction
                document.body.innerHTML = NewBillUI();

                // get DOM element
                const newBillContainer = new NewBill({
                    document, onNavigate, store: null, localStorage: window.localStorage,
                });

                // handle event submit attached file
                const handleSubmit = jest.fn(newBillContainer.handleSubmit);
                newBillContainer.fileName = 'image.jpg';

                // handle event submit form
                const newBillForm = screen.getByTestId('form-new-bill');
                newBillForm.addEventListener('submit', handleSubmit);
                fireEvent.submit(newBillForm);

                // expected results
                expect(handleSubmit).toHaveBeenCalled();
                expect(screen.getAllByText('Mes notes de frais')).toBeTruthy();
            });
        });

        describe('When I submit a wrong attached file format', () => {
            test('Then the error message should be displayed', () => {

            });
        });
    });
});

// POST
describe('[POST TESTS] Given I am connected as an employee', () => {
    describe("When I am on NewBill Page", () => {
        describe('When i submit the form', () => {
            test('Then it should generate a new bill', async () => {
                // Spy
                const postSpy = jest.spyOn(store, 'bills');

                // new Bill
                const newBill = {
                    "id": "AAAAAAAAAAAAAAAAA",
                    "vat": "AAAAAAAAAAA",
                    "amount": 100,
                    "name": "AAAAA",
                    "fileName": "AAAAAA.jpeg",
                    "commentary": "AAAAAA",
                    "pct": 20,
                    "type": "AAAAAAA",
                    "email": "a@a",
                    "fileUrl": "AAAAAAAAAAAAAAAAAAAAAAA",
                    "date": "AAAAAAAAAAAAAAA",
                    "status": "AAAAAAA",
                    "commentAdmin": "AAAAAAAAA"
                };

                // create bill
                const bills = await store.bills().create(newBill);

                // expected results
                expect(postSpy).toHaveBeenCalledTimes(1);
                expect(bills).toBeTruthy();
                expect(bills.key).toEqual('1234');
            });
        })
    });
});
