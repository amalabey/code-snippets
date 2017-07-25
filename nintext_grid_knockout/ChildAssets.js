// Set child assets
var childAssetsPresenter = new ChildAssetsPresenter();
NWF$("label.ad-form-ca-viewContainer").attr("for","adFormHiddenCheckBox");
var childAssetsJson = NWF$(".ad-form-childAssetsJson").val();
if(childAssetsJson && childAssetsJson.length > 0) {
	var childAssets = NWF$.parseJSON(childAssetsJson);
	childAssetsPresenter.setChildAssets(childAssets);
}


// Handles Child Assets Presenter
function ChildAssetsPresenter() {
	var self = this;

	// Returns child assets from ui
	this.getChildAssets = function (primaryAssetId) {
		var childAssets = ko.toJS(childAssetsViewModel.assets);
		if(childAssets != null && childAssets.length > 0){
			if(primaryAssetId){
				return _.filter(childAssets, function(asset){return asset.primaryAssetId === primaryAssetId});
			}else{
				return childAssets;
			}
		}else{
			return [];
		}
	};

	// Sets a control's value and triggers change event
	this.setControlValue = function (control, value) {
		if (control) {
			control.val(value);
			NWF.FormFiller.Functions.ProcessOnChange(control);
		}
	};

	// Sets child assets to the ui
	this.setChildAssets = function (childAssets) {
		// Get Nintex containers
		var viewContainer = NWF$(".ad-form-ca-viewContainer label");
		var formFillerDiv = NWF.FormFiller.Functions.GetFillerDivObjectForControl(viewContainer);
		var prevHeight = NWF$(".ad-form-ca-viewContainer label").height();

		// Add child assets
		childAssetsViewModel.setChildAssets(childAssets);

		// Resize Nintex form
		var newHeight = NWF$(".ad-form-ca-viewContainer label").height();
		var heightIncrease = newHeight - prevHeight;
		NWF.FormFiller.Functions.RepositionAndResizeOtherControlsAndFillerContainerHeight(viewContainer, heightIncrease, heightIncrease, formFillerDiv);
	};

	// Remove child assets belong to a given primary asset
	this.removeChildAssets = function (removingPrimaryAssetId) {
		// Get Nintex containers
		var viewContainer = NWF$(".ad-form-ca-viewContainer label");
		var formFillerDiv = NWF.FormFiller.Functions.GetFillerDivObjectForControl(viewContainer);
		var prevHeight = NWF$(".ad-form-ca-viewContainer label").height();

		childAssetsViewModel.assets.remove(function(asset) { return asset.primaryAssetId === removingPrimaryAssetId; });

		// Resize Nintex form
		var newHeight = NWF$(".ad-form-ca-viewContainer label").height();
		var heightIncrease = newHeight - prevHeight;
		NWF.FormFiller.Functions.RepositionAndResizeOtherControlsAndFillerContainerHeight(viewContainer, heightIncrease, heightIncrease, formFillerDiv);
	}
		
}


// Knockout View Model
function ChildAssetsViewModel(){
	var self = this;
	self.assets = ko.observableArray();
	
	self.totalWdv = ko.computed(function(){
		/* some computation */
		return total;
	});
	
	self.totalAssetCost = ko.computed(function(){
		/* some computation */
		return total;
	});

	self.setChildAssets = function(childAssets){
		var existingAssets = self.assets.removeAll();
		if(childAssets && childAssets.length > 0) {
			_.each(childAssets, function (childAsset, childAssetIndex) {
				//Add a row to view model
				console.log("Adding new child asset row");
				
				if(childAsset.isDisposed){
					childAsset.isDisposed = ko.observable(childAsset.isDisposed);
				}else if(existingAssets != null){
					var existingAsset = _.find(existingAssets, function(asset){ return asset.childAssetId === childAsset.childAssetId});
					if(existingAsset != null){
						var existingAssetDisposed = ko.utils.unwrapObservable(existingAsset.isDisposed);
						childAsset.isDisposed = ko.observable(existingAssetDisposed);
					}else{
						childAsset.isDisposed = ko.observable(false);
					}
				}else{
					childAsset.isDisposed = ko.observable(false);
				}

				// set observables to formatted currency values
				childAsset.wdvFormatted = ko.observable(formatCurrency(childAsset.wdv));
				childAsset.assetCostFormatted = ko.observable(formatCurrency(childAsset.assetCost));

				// Subscribe to checked/disposed event
				childAsset.isDisposed.subscribe(function(newValue) {
					financialDetailsPresenter.updateAsset(childAsset.primaryAssetId);
				});

				self.assets.push(childAsset);
			});
		}
	};
}

// Initializes child assets view model
var childAssetsViewModel = new ChildAssetsViewModel();
var childAssetsView = NWF$(".ad-form-ca-viewContainer");
ko.applyBindings(childAssetsViewModel, childAssetsView[0]);