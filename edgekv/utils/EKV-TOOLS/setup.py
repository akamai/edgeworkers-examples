from setuptools import setup, find_packages

setup(
    # Needed to silence warnings (and to be a worthwhile package)
    name='EKV-TOOLS',
    url='https://github.com/akamai/edgeworkers-examples/tree/master/edgeKV/EKV-TOOLS',
    packages=find_packages(),
    install_requires=['PyJWT'],
    version='0.4',
    license='Apache-2.0',
    description='A set of utilities for the EdgeKV product',
    # We will also need a readme eventually (there will be a warning)
    long_description_content_type="text/markdown",
    long_description=open('README.md', 'r').read(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: Apache-2.0 License",
        "Operating System :: OS Independent",
    ],
    python_requires='>=3.6',
)
