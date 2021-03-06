import React from 'react'
import {
	Dimensions,
	StyleSheet,
	View,
	Text
} from 'react-native'
import { WebView } from 'react-native-webview'

import AzureInstance from './AzureInstance'
import Auth from './Auth'

export default class AzureLoginView extends React.Component {
	props: {
		azureInstance: AzureInstance,
		onSuccess?: ?Function,
		onCancel?: ?Function,
		onNavigationStateChange?: ?Function,
	}

	state: {
		visible: bool,
	}

	constructor(props: any){
		super(props)

		this.auth = new Auth(this.props.azureInstance)
		this.state = {
			visible: true,
			cancelled: false,
		}

		this._handleTokenRequest = this._handleTokenRequest.bind(this)
		this._renderLoadingView = this._renderLoadingView.bind(this)
		this._handleNavigationStateChange = this._handleNavigationStateChange.bind(this)
	}

	_handleNavigationStateChange(e: any) {
		const { onNavigationStateChange } = this.props

		if (onNavigationStateChange) {
			onNavigationStateChange(e)
		}

		this._handleTokenRequest(e)
	}

	_handleTokenRequest(e: any): any {
		let idToken = /(#id_token\=)[^\&]+/.exec(e.url)

		// get id_token when url chage
		if (idToken !== null) {
			const token = String(idToken[0]).replace(/#id_token\=/, '')
			this.setState({ visible: false })

			this.props.azureInstance.setToken(token)
			this.props.onSuccess()
		}

		// if user cancels the process before finishing
		if (!this.state.cancelled && this.props.onCancel && e.url.indexOf('error=access_denied') > -1) {
			this.setState({ cancelled: true, visible: false })

			// call cancel handler
			this.props.onCancel()
		}
	}

	_renderLoadingView() {
		return this.props.loadingView === undefined ? (
			<View
				style={[
					this.props.style,
					styles.loadingView,
				]}
			>
				<Text>{this.props.loadingMessage}</Text>
			</View>
		) : this.props.loadingView
	}

	render() {
		let js = `document.getElementsByTagName('body')[0].style.height = '${Dimensions.get('window').height}px';`

		return (
			this.state.visible ? (
				<WebView
					automaticallyAdjustContentInsets={true}
					style={[this.props.style]}
					source={{uri: this.auth.getAuthUrl()}}
					javaScriptEnabled={true}
					domStorageEnabled={true}
					decelerationRate="normal"
					javaScriptEnabledAndroid={true}
					onNavigationStateChange={this._handleNavigationStateChange}
					onShouldStartLoadWithRequest={(e) => {return true}}
					startInLoadingState={true}
					injectedJavaScript={js}
					scalesPageToFit={true}
				/> ) : this._renderLoadingView()
		)
	}

}

const styles = StyleSheet.create({
	loadingView: {
		alignItems: 'center',
		justifyContent: 'center'
	}
})
