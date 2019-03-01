let table;
let currentEditRow;
const icons = '<i class="fas fa-trash removeIcon" onclick="removeRow(this)"></i> <i class="fas fa-edit editIcon" onclick="showEditRowModal(this)"></i>';
let inputsMetaData = [];
let currentColumnIndex;
Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
};

window.onload = function () {
    if (window.jQuery) {
        $(document).ready(function () {
            // create icon to remove and add column
            $('body').append($('<div class="float" id="column-actions"><i class="fas fa-plus-circle text-success" id="icon-add-column"></i><i class="fas fa-trash text-danger" id="icon-remove-column"></i></div>'));
            $('#column-actions').hide();

            initDataTable();
            initRowEdition();

            // add row
            $("#add-row").on("click", function (event) {
                event.preventDefault();
                $('.fas.fa-check').css('visibility', 'visible');
                const newRow = [];
                document.querySelectorAll(".create-row .form-control").forEach(function (element) {
                    newRow.push(element.value);
                });
                newRow.push(icons);
                table.row.add(newRow).draw(false);

                window.setTimeout(() => {
                    $('.fas.fa-check').css('visibility', 'hidden');
                }, 1000);
            });

            // edit row
            $('#edit-row-confirm').on('click', function () {
                const editedRow = [];
                document.querySelectorAll(".edit-row-modal .form-control").forEach(function (element) {
                    editedRow.push(element.value);
                });
                editedRow.push(icons);
                table.row(currentEditRow).data(editedRow).draw();
                $('.edit-row-modal').modal('hide');
            });


            $('#create-column-input02').on('change', function () {
                $('.constrains').css('display', 'none');
                const selectValue = $(this).val();
                if (selectValue === 'drop-down') {
                    $('.type01').css('display', 'flex');
                } else if (selectValue === 'text') {
                    $('.type02').css('display', 'flex');
                } else if (selectValue === 'number') {
                    $('.type03').css('display', 'flex');
                }
                else if (selectValue === 'date') {
                    $('.type04').css('display', 'flex');
                }
            });

            // manage icon to remove and add column
            toggleColumnActionsIcons();

            $('#column-actions').on('mouseenter', function () {
                $('#column-actions').stop().fadeTo(500, 1);
            });

            $('#column-actions').on('mouseleave', function () {
                $('#column-actions').stop().fadeTo(500, 0);
            });
            // end

            // show the add column modal
            $('#icon-add-column').on('click', function () {
                $('.add-column-modal').modal('show');
            });

            // add column
            $('#add-column').on('click', function () {
                const inputMetaDataObj = {};
                inputMetaDataObj.name = $('#create-column-input01').val();
                inputMetaDataObj.type = $('#create-column-input02').val();
                if (inputMetaDataObj.type === 'drop-down') {
                    inputMetaDataObj.optionsArray = $('#type01-input01').val().split(',');
                    inputMetaDataObj.defaultValue = $('#type01-input02').val();
                } else if (inputMetaDataObj.type === 'text') {
                    inputMetaDataObj.placeholder = $('#type02-input01').val();
                    inputMetaDataObj.pattern = $('#type02-input02').val();
                    inputMetaDataObj.defaultValue = $('#type02-input03').val();
                } else if (inputMetaDataObj.type === 'number') {
                    inputMetaDataObj.placeholder = $('#type03-input01').val();
                    inputMetaDataObj.pattern = $('#type03-input02').val();
                    inputMetaDataObj.minValue = $('#type03-input03').val();
                    inputMetaDataObj.maxValue = $('#type03-input04').val();
                    inputMetaDataObj.defaultValue = $('#type03-input05').val();
                } else if (inputMetaDataObj.type === 'date') {
                    // TODO
                }
                inputsMetaData.splice(currentColumnIndex, 0, inputMetaDataObj);
                updateRowEdition(inputMetaDataObj);

                table.destroy();
                const currentDataSet = table.rows().data().toArray();
                currentDataSet.forEach(function (array) {
                    array.pop();
                    array.splice(currentColumnIndex, 0, inputMetaDataObj.defaultValue);
                });
                localStorage.setItem("table-data-set", JSON.stringify(currentDataSet));
                $('#table_id th:nth-child(' + (currentColumnIndex + 1) + ')').before($('<th scope="col">' + inputMetaDataObj.name + '</th>'));
                toggleColumnActionsIcons('#table_id th:nth-child(' + (currentColumnIndex + 1) + ')');
                initDataTable();
                $('.add-column-modal').modal('hide');
            });
        });
    }
}

window.onunload = function () {
    if (table) {
        const currentDataSet = table.rows().data().toArray();
        currentDataSet.forEach(function (array) {
            array.pop();
        });
        localStorage.setItem("table-data-set", JSON.stringify(currentDataSet));
    }

    if (inputsMetaData.length > 0) {
        localStorage.setItem('inputs-meta-data', JSON.stringify(inputsMetaData));
    }
}

/**
 * Init the data table
 */
function initDataTable() {
    const inputsMetaDataString = localStorage.getItem('inputs-meta-data');
    if (inputsMetaDataString && $('#table_id th').length === 1) {
        inputsMetaData = JSON.parse(inputsMetaDataString);
        inputsMetaData.forEach(function (inputMetaDataObj) {
            $('#table_id th').last().before($('<th scope="col">' + inputMetaDataObj.name + '</th>'));
        });
    }

    const dataSetString = localStorage.getItem("table-data-set");
    if (dataSetString) {
        const dataSet = JSON.parse(dataSetString);
        dataSet.forEach(function (array) {
            array.push(icons);
        })
        table = $('#table_id').DataTable({
            data: dataSet
        });

    } else {
        const exampleDataSet = [];
        table = $('#table_id').DataTable({
            data: exampleDataSet
        });
    }
}

/**
 * create all inputs with meta data
 */
function initRowEdition() {
    const inputsMetaDataString = localStorage.getItem('inputs-meta-data');
    if (inputsMetaDataString) {
        inputsMetaData = JSON.parse(inputsMetaDataString);
        inputsMetaData.forEach(function (inputMetaDataObj) {
            const result = createInput(inputMetaDataObj);
            $('.create-row .form-row').append($(result));
            $('.edit-row-modal .form-row').append($(result));
        });
    }
}

/**
 * 
 * @param {object} inputMetaDataObj 
 * @return the html as string created with meta data
 */
function createInput(inputMetaDataObj) {
    let result = '';
    if (inputMetaDataObj.type === 'drop-down') {
        let temp = '';
        inputMetaDataObj.optionsArray.forEach(function (value, index) {
            temp += '<option value="' + value + '"';
            index === 0 ? temp += 'selected>' : temp += '>';
            temp += value + '</option>';
        });
        result = '<div class="col-md-2 mb-3"><label>' + inputMetaDataObj.name + '</label> <select class="form-control">' + temp + '</select> </div>';
    } else if (inputMetaDataObj.type === 'text') {
        result = '<div class="col-md-2 mb-3"><label>' + inputMetaDataObj.name + '</label><input type="text" class="form-control" placeholder="' + inputMetaDataObj.placeholder + '" pattern="' + inputMetaDataObj.pattern + '"></div>';
    } else if (inputMetaDataObj.type === 'number') {
        inputMetaDataObj.placeholder = $('#type03-input01').val();
        result = '<div class="col-md-2 mb-3"><label>' + inputMetaDataObj.name + '</label><input type="number" class="form-control" placeholder="' + inputMetaDataObj.placeholder + '" pattern="' + inputMetaDataObj.pattern + '" min="' + inputMetaDataObj.minValue + '" max="' + inputMetaDataObj.maxValue + '"></div>';
    } else if (inputMetaDataObj.type === 'date') {
        // TODO
    }
    return result;
}

/**
 * Remove a row form the table.
 * @param {HTMLElement} rowChild - a child element of the row to remove.
 */
function removeRow(rowChild) {
    table
        .row($(rowChild).parents('tr'))
        .remove()
        .draw();
}

/**
 * Create the modal to edit row.
 * @param {HTMLElement} rowChild - a child element of the row to edit.
 */
function showEditRowModal(rowChild) {
    $('.edit-row-modal').modal('show');
    currentEditRow = $(rowChild).parents('tr');
    const rowInputValue = [];
    $(rowChild).parents('tr').find('td').each(function () {
        rowInputValue.push($(this).text());
    });

    $('.edit-row-modal .form-control').each(function (index) {
        $(this).val(rowInputValue[index]);
    });
}

/**
 * update the create row and edit row modal
 * @param inputMetaDataObj - the input meta data object
 */
function updateRowEdition(inputMetaDataObj) {
    const targetElement = $('.create-row .form-row div:nth-child(' + (currentColumnIndex + 1) + ')');
    if (targetElement.length > 0) {
        targetElement.before($(createInput(inputMetaDataObj)));
    } else {
        $('.create-row .form-row').append($(createInput(inputMetaDataObj)));
    }

    const targetElementModal = $('.edit-row-modal .form-row div:nth-child(' + (currentColumnIndex + 1) + ')');
    if (targetElementModal.length > 0) {
        targetElementModal.before($(createInput(inputMetaDataObj)));
    } else {
        $('.edit-row-modal .form-row').append($(createInput(inputMetaDataObj)));
    }
}

/**
 * 
 * @param {string} selector 
 */
function toggleColumnActionsIcons(selector = '#table_id th') {
    $(selector).on('mouseenter', function () {
        currentColumnIndex = $('#table_id th').index($(this));
        $('#icon-remove-column').css('visibility', 'visible');
        if ($(this).hasClass('default')) {
            $('#icon-remove-column').css('visibility', 'hidden');
        }
        const tableHeadOffest = $(this).offset();
        const columnActions = $('#column-actions');
        columnActions.stop().fadeTo(500, 1);
        columnActions.offset({ top: tableHeadOffest.top - columnActions.innerWidth(), left: tableHeadOffest.left });
    });

    $(selector).on('mouseleave', function () {
        $('#column-actions').stop().fadeTo(1000, 0);
    });
}