<?php

namespace Theunwindfront\FluidScale;

use Illuminate\Support\ServiceProvider;

class FluidScaleServiceProvider extends ServiceProvider
{
    /**
     * Bootstraps the package services.
     */
    public function boot()
    {
        // No views or components needed directly in the package itself,
        // but we can register standard assets or leave it open for extension.
    }

    /**
     * Registers application bindings.
     */
    public function register()
    {
        //
    }
}
