var Dashboard = (function($, ko, jsonData) {
    var MODULE = {};
    var PAGE_SIZE = 5;

    // Init method
    // public
    MODULE.init = function() {
        // Syllabus
        var syllabusList = [];

        $.each(jsonData.syllabusList, function(index, value) {
            syllabusList.push(new MODELS.ListItemModel(value));
        });
        var syllabusViewModel = new MODELS.DashboardModel(syllabusList, 'syllabus');
        ko.applyBindings(syllabusViewModel, $("[data-slug='syllabus']")[0]);

        // Rubric
        var rubricList = [];

        $.each(jsonData.rubricList, function(index, value) {
            rubricList.push(new MODELS.ListItemModel(value));
        });
        var rubricViewModel = new MODELS.DashboardModel(rubricList, 'rubric');
        ko.applyBindings(rubricViewModel, $("[data-slug='rubric']")[0]);

        MODULE.bindUIActions(syllabusViewModel);
        MODULE.bindUIActions(rubricViewModel);

    };

    MODULE.bindUIActions = function(viewModel) {
        $("#btnProfileSubmit").click(function() {
            $("#profileForm").submit();
        });

        $("#btnChangePasswordSubmit").click(function() {
            $('#change_password_form').submit();
        });

        // $(viewModel.context + " #btnDownload").click(function() {
        //     var item = viewModel.selectedItems()[0];
        //     $("#inputDownload").val(item.pk);
        //     $("#formDownload").submit();
        // });

        // $(viewModel.context + " #btnDelete").click(function() {
        //     // Do some stuff
        // });
    };

    // Model declaration

    var MODELS = (function() {
        var models = {};

        models.DashboardModel = function(items, context) {
            var self = this;
            self.context = "[data-slug='" + context + "']";
            self.btnDownload = $(self.context + " #btnDownload");
            self.btnDownloadAll = $(self.context + " #btnDownloadAll");
            self.btnDelete = $(self.context + " #btnDelete");

            self.btnDownload.click(function() {
                var item = self.selectedItems()[0];
                $("#inputDownload").val(item.pk);
                $("#formDownload").submit();
            });

            self.listItems = ko.observableArray(items);

            self.pageIndex = ko.observable(1);
            self.pagedList = ko.computed(function() {
                var startIndex = (self.pageIndex() - 1) * PAGE_SIZE;
                var endIndex = startIndex + PAGE_SIZE;
                return self.listItems().slice(startIndex, endIndex);
            }, self);

            self.selectedItems = ko.computed(function() {
                var items = [];

                $.each(self.listItems(), function(index, item) {
                    if (item.isSelected()) {
                        items.push(item);
                    }
                });

                return items;
            });

            self.selectedItems.subscribe(function() {
                switch (self.selectedItems().length) {
                    case 0:
                        self.btnDownload.hide();
                        self.btnDownloadAll.hide();
                        self.btnDelete.hide();
                        break;
                    case 1:
                        self.btnDownload.show();
                        self.btnDownloadAll.hide();
                        self.btnDelete.show();
                        break;
                    default:
                        self.btnDownload.hide();
                        self.btnDownloadAll.show();
                        self.btnDelete.show();
                }
            });

            // TODO: Disable buttons on first and last pages.
            self.nextPage = function() {
                self.pageIndex(self.pageIndex() + 1);
            };

            self.previousPage = function() {
                self.pageIndex(self.pageIndex() - 1);
            };

            self.hasMoreThanOnePage = ko.computed(function() {
                return self.listItems().length / PAGE_SIZE >= 1 ? true : false;
            }, self);
        };

        models.ListItemModel = function(value) {
            var self = this;
            // Quotes for static things
            self.pk = value.pk;
            self.itemName = value.itemName;
            self.lastModified = value.lastModified;
            self.url = "/" + value.url + "/" + value.pk;

            // Observables for things that change
            self.isSelected = ko.observable(false);

            self.select = function(data, event) {
                if (event.target.tagName != "INPUT") {
                    window.location.href = data.url;
                }

                return true;
            };
        };

        return models;
    })();

    return MODULE;

})(Zepto, ko, jsonData);

$(document).ready(function() {
    Dashboard.init();
});
